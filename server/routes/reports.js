const express = require("express")
const ExcelJS = require("exceljs")
const moment = require("moment")
const Session = require("../models/Session")
const Appointment = require("../models/Appointment")
const User = require("../models/User")
const auth = require("../middleware/auth")
const router = express.Router()

// Generate report data
router.post("/generate", auth, async (req, res) => {
  try {
    if (req.user.role !== "counsellor" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    const {
      reportType, // 'sessions', 'appointments', 'clients'
      dateRange,
      startDate,
      endDate,
      category,
      status,
      residenceType,
      department,
      counsellorId,
      groupBy,
      fields,
    } = req.body

    const query = {}
    let dateField = "createdAt"

    // Build date query
    if (dateRange === "custom" && startDate && endDate) {
      query[dateField] = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    } else if (dateRange === "today") {
      query[dateField] = {
        $gte: moment().startOf("day").toDate(),
        $lte: moment().endOf("day").toDate(),
      }
    } else if (dateRange === "week") {
      query[dateField] = {
        $gte: moment().startOf("week").toDate(),
        $lte: moment().endOf("week").toDate(),
      }
    } else if (dateRange === "month") {
      query[dateField] = {
        $gte: moment().startOf("month").toDate(),
        $lte: moment().endOf("month").toDate(),
      }
    }

    let data = []
    let Model, populateFields

    if (reportType === "sessions") {
      Model = Session
      populateFields = [
        { path: "client", select: "name email registrationNumber department residenceType" },
        { path: "counsellor", select: "name email" },
        { path: "appointment", select: "category" },
      ]
      dateField = "sessionDate"
    } else if (reportType === "appointments") {
      Model = Appointment
      populateFields = [
        { path: "client", select: "name email registrationNumber department residenceType" },
        { path: "counsellor", select: "name email" },
      ]
    }

    // Add filters
    if (category) query["appointment.category"] = category
    if (status) query.status = status
    if (counsellorId && req.user.role === "admin") query.counsellor = counsellorId
    if (req.user.role === "counsellor") query.counsellor = req.user.userId

    data = await Model.find(query)
      .populate(populateFields)
      .sort({ [dateField]: -1 })

    // Apply additional filters
    if (residenceType || department) {
      data = data.filter((item) => {
        const client = item.client
        if (residenceType && client.residenceType !== residenceType) return false
        if (department && client.department !== department) return false
        return true
      })
    }

    // Group data if requested
    const groupedData = {}
    if (groupBy) {
      data.forEach((item) => {
        let key
        if (groupBy === "counsellor") key = item.counsellor?.name || "Unassigned"
        else if (groupBy === "category") key = item.appointment?.category || item.category
        else if (groupBy === "date") key = moment(item[dateField]).format("YYYY-MM-DD")
        else if (groupBy === "department") key = item.client?.department || "Unknown"

        if (!groupedData[key]) groupedData[key] = []
        groupedData[key].push(item)
      })
    }

    res.json({
      data: groupBy ? groupedData : data,
      summary: {
        total: data.length,
        dateRange: { startDate, endDate },
        filters: { category, status, residenceType, department },
      },
    })
  } catch (error) {
    console.error("Report generation error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Export to Excel
router.post("/export", auth, async (req, res) => {
  try {
    if (req.user.role !== "counsellor" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    const { data, reportType, fields, title } = req.body

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet("Report")

    // Set up headers based on selected fields
    const headers = []
    const fieldMapping = {
      "client.name": "Client Name",
      "client.registrationNumber": "Registration Number",
      "client.department": "Department",
      "client.residenceType": "Residence Type",
      "counsellor.name": "Counsellor",
      category: "Category",
      status: "Status",
      sessionDate: "Session Date",
      summary: "Summary",
      progress: "Progress",
      createdAt: "Created Date",
    }

    fields.forEach((field) => {
      headers.push(fieldMapping[field] || field)
    })

    worksheet.addRow(headers)

    // Style headers
    const headerRow = worksheet.getRow(1)
    headerRow.font = { bold: true }
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE6F3FF" },
    }

    // Add data rows
    data.forEach((item) => {
      const row = []
      fields.forEach((field) => {
        let value = ""
        if (field.includes(".")) {
          const [parent, child] = field.split(".")
          value = item[parent]?.[child] || ""
        } else {
          value = item[field] || ""
        }

        if (field.includes("Date") && value) {
          value = moment(value).format("YYYY-MM-DD HH:mm")
        }

        row.push(value)
      })
      worksheet.addRow(row)
    })

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      column.width = 15
    })

    // Set response headers
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${title || "report"}_${moment().format("YYYY-MM-DD")}.xlsx"`,
    )

    // Write to response
    await workbook.xlsx.write(res)
    res.end()
  } catch (error) {
    console.error("Excel export error:", error)
    res.status(500).json({ message: "Export failed" })
  }
})

// Get report statistics
router.get("/stats", auth, async (req, res) => {
  try {
    if (req.user.role !== "counsellor" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    const query = {}
    if (req.user.role === "counsellor") {
      query.counsellor = req.user.userId
    }

    const [totalSessions, totalAppointments, pendingAppointments, completedSessions, followUpRequired] =
      await Promise.all([
        Session.countDocuments(query),
        Appointment.countDocuments(query),
        Appointment.countDocuments({ ...query, status: "pending" }),
        Session.countDocuments({ ...query, progress: "Resolved" }),
        Session.countDocuments({ ...query, isFollowUpRequired: true }),
      ])

    // Category breakdown
    const categoryStats = await Appointment.aggregate([
      { $match: query },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    res.json({
      overview: {
        totalSessions,
        totalAppointments,
        pendingAppointments,
        completedSessions,
        followUpRequired,
      },
      categoryBreakdown: categoryStats,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
