import ExcelJS from 'exceljs';
import { Task, VacationPlan, TrainingPlan } from '../types';

interface ExportData {
  tasks: Task[];
  vacations: VacationPlan[];
  trainings: TrainingPlan[];
}

export async function exportToExcel(data: ExportData, fileName: string = 'Task_Management_Report') {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Task Management System';
  workbook.created = new Date();

  // ============ Tasks Sheet ============
  const tasksSheet = workbook.addWorksheet('Tasks');
  
  // Add headers
  tasksSheet.columns = [
    { header: 'Task ID', key: 'id', width: 15 },
    { header: 'Title', key: 'title', width: 30 },
    { header: 'Description', key: 'description', width: 40 },
    { header: 'Assigned To', key: 'assignedTo', width: 20 },
    { header: 'Start Date', key: 'startDate', width: 15 },
    { header: 'Due Date', key: 'dueDate', width: 15 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Priority', key: 'priority', width: 12 },
    { header: 'Created At', key: 'createdAt', width: 15 },
    { header: 'Updated At', key: 'updatedAt', width: 15 },
  ];

  // Style header row
  const headerRow = tasksSheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }, // Blue
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 20;

  // Add data rows with colors
  data.tasks.forEach((task) => {
    const row = tasksSheet.addRow({
      id: task.id,
      title: task.title,
      description: task.description,
      assignedTo: (task as any).assignedUserName || task.assignedUser?.name || 'Unknown',
      startDate: new Date(task.startDate).toLocaleDateString(),
      dueDate: new Date(task.dueDate).toLocaleDateString(),
      status: task.status,
      priority: task.priority,
      createdAt: new Date(task.createdAt).toLocaleDateString(),
      updatedAt: new Date(task.updatedAt).toLocaleDateString(),
    });

    // Color code Status column (column 7)
    const statusCell = row.getCell(7);
    if (task.status === 'Completed') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
      statusCell.font = { color: { argb: 'FF006100' } };
    } else if (task.status === 'In Progress') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB9C' } };
      statusCell.font = { color: { argb: 'FF9C5700' } };
    } else if (task.status === 'Delayed') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
      statusCell.font = { color: { argb: 'FF9C0006' } };
    } else if (task.status === 'New') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE7E6E6' } };
    }

    // Color code Priority column (column 8)
    const priorityCell = row.getCell(8);
    if (task.priority === 'High') {
      priorityCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
      priorityCell.font = { color: { argb: 'FF9C0006' } };
    } else if (task.priority === 'Medium') {
      priorityCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB9C' } };
      priorityCell.font = { color: { argb: 'FF9C5700' } };
    } else if (task.priority === 'Low') {
      priorityCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
      priorityCell.font = { color: { argb: 'FF006100' } };
    }
  });

  // ============ Vacations Sheet ============
  const vacationsSheet = workbook.addWorksheet('Vacations');
  
  vacationsSheet.columns = [
    { header: 'Plan ID', key: 'id', width: 15 },
    { header: 'Employee', key: 'employee', width: 20 },
    { header: 'Type', key: 'type', width: 15 },
    { header: 'Start Date', key: 'startDate', width: 15 },
    { header: 'End Date', key: 'endDate', width: 15 },
    { header: 'Days', key: 'days', width: 10 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Notes', key: 'notes', width: 40 },
    { header: 'Created At', key: 'createdAt', width: 15 },
    { header: 'Updated At', key: 'updatedAt', width: 15 },
  ];

  // Style header
  const vacHeaderRow = vacationsSheet.getRow(1);
  vacHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  vacHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF70AD47' }, // Green
  };
  vacHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };
  vacHeaderRow.height = 20;

  data.vacations.forEach((vacation) => {
    const days = Math.ceil((new Date(vacation.endDate).getTime() - new Date(vacation.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const row = vacationsSheet.addRow({
      id: vacation.id,
      employee: (vacation as any).userName || vacation.user?.name || 'Unknown',
      type: vacation.type,
      startDate: new Date(vacation.startDate).toLocaleDateString(),
      endDate: new Date(vacation.endDate).toLocaleDateString(),
      days: days,
      status: vacation.status,
      notes: vacation.notes || '',
      createdAt: new Date(vacation.createdAt).toLocaleDateString(),
      updatedAt: new Date(vacation.updatedAt).toLocaleDateString(),
    });

    // Color code Status column (column 7)
    const statusCell = row.getCell(7);
    if (vacation.status === 'approved') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
      statusCell.font = { color: { argb: 'FF006100' } };
    } else if (vacation.status === 'pending') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB9C' } };
      statusCell.font = { color: { argb: 'FF9C5700' } };
    } else if (vacation.status === 'rejected') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
      statusCell.font = { color: { argb: 'FF9C0006' } };
    }
  });

  // ============ Trainings Sheet ============
  const trainingsSheet = workbook.addWorksheet('Trainings');
  
  trainingsSheet.columns = [
    { header: 'Plan ID', key: 'id', width: 15 },
    { header: 'Employee', key: 'employee', width: 20 },
    { header: 'Course Name', key: 'courseName', width: 30 },
    { header: 'Platform', key: 'platform', width: 25 },
    { header: 'Duration', key: 'duration', width: 20 },
    { header: 'Start Date', key: 'startDate', width: 15 },
    { header: 'End Date', key: 'endDate', width: 15 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Notes', key: 'notes', width: 40 },
    { header: 'Created At', key: 'createdAt', width: 15 },
    { header: 'Updated At', key: 'updatedAt', width: 15 },
  ];

  // Style header
  const trainHeaderRow = trainingsSheet.getRow(1);
  trainHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  trainHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF7030A0' }, // Purple
  };
  trainHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };
  trainHeaderRow.height = 20;

  data.trainings.forEach((training) => {
    const row = trainingsSheet.addRow({
      id: training.id,
      employee: (training as any).userName || training.user?.name || 'Unknown',
      courseName: training.courseName,
      platform: training.platform,
      duration: training.duration,
      startDate: training.startDate ? new Date(training.startDate).toLocaleDateString() : '-',
      endDate: training.endDate ? new Date(training.endDate).toLocaleDateString() : '-',
      status: training.status,
      notes: training.notes || '',
      createdAt: new Date(training.createdAt).toLocaleDateString(),
      updatedAt: new Date(training.updatedAt).toLocaleDateString(),
    });

    // Color code Status column (column 8)
    const statusCell = row.getCell(8);
    if (training.status === 'approved') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
      statusCell.font = { color: { argb: 'FF006100' } };
    } else if (training.status === 'pending') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB9C' } };
      statusCell.font = { color: { argb: 'FF9C5700' } };
    } else if (training.status === 'rejected') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
      statusCell.font = { color: { argb: 'FF9C0006' } };
    }
  });

  // ============ Summary Sheet ============
  const summarySheet = workbook.addWorksheet('Summary');
  
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 30 },
    { header: 'Value', key: 'value', width: 15 },
  ];

  const completedTasks = data.tasks.filter(t => t.status === 'Completed').length;
  const completionRate = data.tasks.length > 0 ? ((completedTasks / data.tasks.length) * 100).toFixed(2) : '0.00';
  
  const summaryData = [
    { metric: '=== TASKS SUMMARY ===', value: '' },
    { metric: 'Total Tasks', value: data.tasks.length },
    { metric: 'Completed Tasks', value: completedTasks },
    { metric: 'In Progress Tasks', value: data.tasks.filter(t => t.status === 'In Progress').length },
    { metric: 'Delayed Tasks', value: data.tasks.filter(t => t.status === 'Delayed').length },
    { metric: 'New Tasks', value: data.tasks.filter(t => t.status === 'New').length },
    { metric: 'Completion Rate (%)', value: completionRate },
    { metric: '', value: '' },
    { metric: '=== VACATIONS SUMMARY ===', value: '' },
    { metric: 'Total Vacations', value: data.vacations.length },
    { metric: 'Approved Vacations', value: data.vacations.filter(v => v.status === 'approved').length },
    { metric: 'Pending Vacations', value: data.vacations.filter(v => v.status === 'pending').length },
    { metric: 'Rejected Vacations', value: data.vacations.filter(v => v.status === 'rejected').length },
    { metric: '', value: '' },
    { metric: '=== TRAININGS SUMMARY ===', value: '' },
    { metric: 'Total Trainings', value: data.trainings.length },
    { metric: 'Approved Trainings', value: data.trainings.filter(t => t.status === 'approved').length },
    { metric: 'Pending Trainings', value: data.trainings.filter(t => t.status === 'pending').length },
    { metric: 'Rejected Trainings', value: data.trainings.filter(t => t.status === 'rejected').length },
    { metric: '', value: '' },
    { metric: 'Report Generated On', value: new Date().toLocaleString() },
    { metric: 'Year End Report', value: new Date().getFullYear() },
  ];

  summarySheet.addRows(summaryData);

  // Style summary header
  const summaryHeaderRow = summarySheet.getRow(1);
  summaryHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  summaryHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFC000' }, // Orange
  };
  summaryHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };
  summaryHeaderRow.height = 20;

  // Style section headers
  summarySheet.getRow(1).font = { bold: true, size: 12 };
  summarySheet.getRow(9).font = { bold: true, size: 12 };
  summarySheet.getRow(15).font = { bold: true, size: 12 };

  // Generate filename with date
  const date = new Date();
  const year = date.getFullYear();
  const dateStr = date.toISOString().split('T')[0];
  const finalFileName = `${fileName}_${year}_${dateStr}.xlsx`;

  // Write file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = finalFileName;
  link.click();
  window.URL.revokeObjectURL(url);
}
