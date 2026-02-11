from fastapi import FastAPI, UploadFile, File, Form, status

app = FastAPI(title="KYC Service")

@app.post("/kyc/upload", status_code=status.HTTP_202_ACCEPTED)
async def upload_kyc(document_type: str = Form(...), file: UploadFile = File(...)):
    print(f"Received KYC document: {document_type} - {file.filename}")
    # Save file to S3 and trigger screening
    return {"message": "Documents uploaded and queued for verification"}
