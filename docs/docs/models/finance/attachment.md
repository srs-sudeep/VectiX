---
sidebar_position: 5
---

# Attachment Model

The `Attachment` model represents bill scans, receipts, and other documents linked to transactions. It supports OCR (Optical Character Recognition) for extracting text from images.

## Table: `attachment`

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (PK) | Unique attachment identifier (UUID) |
| `user_id` | String (FK) | Foreign key to `User` |
| `file_url` | String | URL to the stored file (local path or cloud storage URL) |
| `type` | String | Attachment type: `bill` or `receipt` |
| `extracted_text` | Text (nullable) | OCR-extracted text from the document |
| `linked_transaction_id` | String (FK, nullable) | Foreign key to `Transaction` |

## Attachment Types

- **`bill`** - Bills and invoices
- **`receipt`** - Purchase receipts

## Relationships

- **`user`** (Many-to-One) → `User` - Owner of the attachment
- **`linked_transaction`** (Many-to-One, nullable) → `Transaction` - Transaction this attachment is linked to

## Usage Example

```python
from src.app.models.attachment import Attachment

# Create a receipt attachment
receipt = Attachment(
    id="uuid-here",
    user_id=user.id,
    file_url="/uploads/receipts/receipt_123.jpg",
    type="receipt",
    extracted_text="Total: $50.00\nDate: 2024-01-15\n...",
    linked_transaction_id=transaction.id
)

# Create a bill attachment with OCR
bill = Attachment(
    id="uuid-here",
    user_id=user.id,
    file_url="/uploads/bills/electricity_bill.pdf",
    type="bill",
    extracted_text="Electricity Bill\nAmount Due: $120.50\nDue Date: 2024-02-01",
    linked_transaction_id=transaction.id
)
```

## OCR Integration

The `extracted_text` field can be populated using OCR services:

```python
# Example OCR processing
def process_attachment(file_path: str) -> str:
    # Use OCR service (e.g., Tesseract, Google Vision API)
    extracted_text = ocr_service.extract_text(file_path)
    return extracted_text

# When uploading attachment
attachment = Attachment(
    user_id=user.id,
    file_url=uploaded_file_url,
    type="receipt"
)

# Process OCR
attachment.extracted_text = process_attachment(file_path)
```

## File Storage

Attachments can be stored:
- Locally in the `uploads/` directory
- In cloud storage (AWS S3, Google Cloud Storage, etc.)
- The `file_url` should point to the accessible file location

## Notes

- Attachments are optional and can exist without a linked transaction
- OCR text can be used for automatic transaction creation
- File storage location depends on deployment configuration
- The `extracted_text` field can be used for search and categorization

