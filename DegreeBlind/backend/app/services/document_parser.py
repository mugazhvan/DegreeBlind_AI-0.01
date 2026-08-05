import os
import fitz  # PyMuPDF
import docx
from io import BytesIO
import numpy as np
from PIL import Image
import logging

logger = logging.getLogger(__name__)

from app.services.llm_service import llm_service

class DocumentParser:
    def __init__(self):
        pass

    async def parse_document(self, file_path: str, file_ext: str) -> str:
        """
        Parses a document and extracts text.
        Returns the raw extracted text.
        """
        logger.info(f"Parsing document {file_path} with extension {file_ext}")
        
        if file_ext.lower() == '.pdf':
            return await self._parse_pdf(file_path)
        elif file_ext.lower() in ['.doc', '.docx']:
            return self._parse_docx(file_path)
        elif file_ext.lower() in ['.png', '.jpg', '.jpeg']:
            return await self._parse_image(file_path)
        else:
            raise ValueError(f"Unsupported file extension: {file_ext}")

    async def _parse_pdf(self, file_path: str) -> str:
        text = ""
        try:
            with fitz.open(file_path) as doc:
                for page in doc:
                    text += page.get_text()
        except Exception as e:
            logger.error(f"Error parsing PDF with PyMuPDF: {e}")
            raise
            
        final_text = text.strip()
        if not final_text:
            raise ValueError("Could not extract any text from the PDF. Please ensure it is a digital text-based PDF or DOCX without requiring image scanning.")
        return final_text

    async def _parse_image(self, file_path: str) -> str:
        import base64
        text = ""
        try:
            with open(file_path, "rb") as f:
                img_b64 = base64.b64encode(f.read()).decode('utf-8')
            
            # Determine mime type naively
            mime_type = "image/png" if file_path.lower().endswith(".png") else "image/jpeg"
            
            text = await llm_service.extract_text_from_image(img_b64, mime_type)
        except Exception as e:
            logger.error(f"Image OCR failed for {file_path}. Error: {e}")
            raise ValueError("Failed to parse image.")
            
        final_text = text.strip()
        if not final_text:
            raise ValueError("Could not extract any text from the image.")
        return final_text

    def _parse_docx(self, file_path: str) -> str:
        text = ""
        try:
            doc = docx.Document(file_path)
            for para in doc.paragraphs:
                text += para.text + "\n"
        except Exception as e:
            logger.error(f"Error parsing DOCX: {e}")
            raise
            
        return text.strip()

document_parser = DocumentParser()
