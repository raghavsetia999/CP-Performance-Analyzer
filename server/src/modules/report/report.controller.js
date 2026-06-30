import { successResponse } from '../../utils/ApiResponse.js'
import {
  deleteReportForUser,
  getLatestReportForHandle,
  getReportForUser,
  listReportsForUser,
  saveReportForUser,
} from './report.service.js'
import { createReportPdf } from './report.pdf.js'

export async function saveReport(request, response) {
  const report = await saveReportForUser(request.user, request.body.handle)
  response.status(201).json(successResponse(report))
}

export async function listReports(request, response) {
  response.json(successResponse(await listReportsForUser(request.user.id)))
}

export async function getReport(request, response) {
  response.json(successResponse(await getReportForUser(request.user.id, request.params.id)))
}

export async function getLatestReport(request, response) {
  response.json(
    successResponse(await getLatestReportForHandle(request.user.id, request.params.handle)),
  )
}

export async function deleteReport(request, response) {
  response.json(successResponse(await deleteReportForUser(request.user.id, request.params.id)))
}

export async function exportReport(request, response) {
  const report = await getReportForUser(request.user.id, request.params.id)
  const filename = `cp-performance-${report.handle}-${new Date(report.generatedAt).toISOString().slice(0, 10)}.pdf`
  response.setHeader('Content-Type', 'application/pdf')
  response.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  createReportPdf(report, response)
}
