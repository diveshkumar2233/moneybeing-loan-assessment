from collections.abc import Iterable
from io import BytesIO

from openpyxl import Workbook

from app.models.lead import Lead

EXPORT_COLUMNS = [
    "Lead ID",
    "Customer Name",
    "Mobile",
    "Loan Type",
    "Credit Score",
    "BRE Status",
    "Created Date",
    "Rejection Reasons",
]


def safe_cell_value(value: object) -> object:
    # Customer-entered text must not become an executable spreadsheet formula.
    if isinstance(value, str) and value.startswith(("=", "+", "-", "@")):
        return "'" + value
    return value


def build_leads_workbook(leads: Iterable[Lead]) -> BytesIO:
    workbook = Workbook(write_only=True)
    sheet = workbook.create_sheet("Leads")
    sheet.append(EXPORT_COLUMNS)

    for lead in leads:
        row = [
            lead.id,
            lead.full_name,
            lead.mobile,
            lead.loan_type,
            lead.credit_score,
            lead.bre_status,
            lead.created_at.isoformat(),
            "; ".join(lead.rejection_reasons),
        ]
        sheet.append([safe_cell_value(value) for value in row])

    output = BytesIO()
    workbook.save(output)
    output.seek(0)
    return output
