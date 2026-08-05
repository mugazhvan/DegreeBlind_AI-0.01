import os
import logging
from fpdf import FPDF
from typing import Dict, Any

logger = logging.getLogger(__name__)

class ResumePDF(FPDF):
    def __init__(self, theme_meta: Dict[str, Any], layout_meta: Dict[str, Any]):
        super().__init__()
        self.theme_meta = theme_meta
        self.layout_meta = layout_meta
        
        # Load fonts - fallback to default Arial/Helvetica since we don't have Inter TTF locally
        self.set_font("Helvetica", size=10)
        self.set_margins(15, 15, 15)
        self.set_auto_page_break(auto=True, margin=15)
        self.primary_color = (0, 0, 0)
        self.secondary_color = (100, 100, 100)
        
    def header(self):
        # We only want the banner on the first page
        if self.page_no() == 1:
            banner_url = self.layout_meta.get("banner_url")
            local_path = None
            if banner_url:
                try:
                    # banner_url might be /static/resumes/assets/...
                    # Let's clean it to a relative path
                    if banner_url.startswith("/"):
                        local_path = banner_url[1:]
                    else:
                        local_path = banner_url
                    
                    if os.path.exists(local_path):
                        # Add image at x=0, y=0, w=210 (A4 width)
                        self.image(local_path, x=0, y=0, w=210)
                        # Push the Y cursor down so text doesn't overlap the banner
                        # A 16:9 banner across 210mm width is roughly 118mm height.
                        # We'll make it smaller (e.g. 210x40mm)
                        # self.image auto-scales if only h is given, but we want w=210 and let it scale, then we just move Y
                except Exception as e:
                    logger.warning(f"Could not load banner image into PDF: {e}")
            
            # Move Y down for the rest of the document.
            if banner_url and local_path and os.path.exists(local_path):
                self.set_y(50)  # Move below the banner

    def add_section_title(self, title: str):
        self.ln(5)
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(*self.primary_color)
        self.cell(0, 8, title.upper(), border="B", ln=True)
        self.ln(3)

    def add_contact_info(self, personal_info: Dict[str, Any]):
        self.set_font("Helvetica", "B", 24)
        self.set_text_color(*self.primary_color)
        self.cell(0, 10, personal_info.get("name", "Unknown Name"), ln=True, align="C")
        
        self.set_font("Helvetica", "", 10)
        self.set_text_color(*self.secondary_color)
        
        contact_parts = []
        if personal_info.get("email"): contact_parts.append(personal_info["email"])
        if personal_info.get("phone"): contact_parts.append(personal_info["phone"])
        if personal_info.get("linkedin"): contact_parts.append(personal_info["linkedin"])
        if personal_info.get("github"): contact_parts.append(personal_info["github"])
        
        self.cell(0, 6, " | ".join(contact_parts), ln=True, align="C")
        self.ln(5)

        summary = personal_info.get("summary")
        if summary:
            self.set_font("Helvetica", "", 10)
            self.set_text_color(*self.primary_color)
            self.multi_cell(0, 5, summary)
            self.ln(2)

    def add_experience(self, experience: list):
        if not experience: return
        self.add_section_title("Experience")
        
        for job in experience:
            self.set_font("Helvetica", "B", 11)
            self.cell(100, 6, job.get("role", ""), ln=False)
            self.set_font("Helvetica", "I", 10)
            self.cell(0, 6, job.get("duration", ""), ln=True, align="R")
            
            self.set_font("Helvetica", "B", 10)
            self.cell(0, 6, job.get("company", ""), ln=True)
            
            self.set_font("Helvetica", "", 10)
            for bullet in job.get("achievements", []):
                self.cell(5, 5, chr(149), ln=False) # Bullet point
                # Make sure to handle encoding issues
                clean_bullet = bullet.encode('latin-1', 'replace').decode('latin-1')
                self.multi_cell(0, 5, clean_bullet)
            self.ln(2)

    def add_education(self, education: list):
        if not education: return
        self.add_section_title("Education")
        
        for edu in education:
            self.set_font("Helvetica", "B", 11)
            self.cell(100, 6, edu.get("institution", ""), ln=False)
            self.set_font("Helvetica", "I", 10)
            self.cell(0, 6, edu.get("duration", ""), ln=True, align="R")
            
            self.set_font("Helvetica", "", 10)
            deg = edu.get("degree", "")
            gpa = f" | GPA: {edu['gpa']}" if edu.get("gpa") else ""
            self.cell(0, 6, f"{deg}{gpa}", ln=True)
            self.ln(2)

    def add_projects(self, projects: list):
        if not projects: return
        self.add_section_title("Projects")
        
        for proj in projects:
            self.set_font("Helvetica", "B", 11)
            techs = ", ".join(proj.get("technologies", []))
            tech_str = f" ({techs})" if techs else ""
            self.cell(0, 6, f"{proj.get('name', '')}{tech_str}", ln=True)
            
            self.set_font("Helvetica", "", 10)
            clean_desc = proj.get("description", "").encode('latin-1', 'replace').decode('latin-1')
            self.multi_cell(0, 5, clean_desc)
            self.ln(2)

    def add_skills(self, skills: list):
        if not skills: return
        self.add_section_title("Skills")
        
        for skill in skills:
            self.set_font("Helvetica", "B", 10)
            self.cell(35, 6, f"{skill.get('category', '')}: ", ln=False)
            self.set_font("Helvetica", "", 10)
            clean_skills = ", ".join(skill.get("items", [])).encode('latin-1', 'replace').decode('latin-1')
            self.multi_cell(0, 6, clean_skills)


class PDFGeneratorService:
    async def generate(self, optimized_json: Dict[str, Any], typography_meta: Dict[str, Any], layout_meta: Dict[str, Any], generation_id: int) -> str:
        """
        Generates a PDF using FPDF and saves it to static/resumes/final/
        """
        pdf = ResumePDF(typography_meta, layout_meta)
        pdf.add_page()
        
        # FPDF encodes strings to latin-1 by default in basic fonts. We ensure dicts have safely encoded strings
        # We did this in the individual add_* methods.
        
        # Use .get() defensively as sometimes LLM outputs slightly different schema
        pdf.add_contact_info(optimized_json.get("personal_info", {}))
        
        # Resume flow is usually Experience -> Projects -> Skills -> Education
        pdf.add_experience(optimized_json.get("experience", []))
        pdf.add_projects(optimized_json.get("projects", []))
        pdf.add_skills(optimized_json.get("skills", []))
        pdf.add_education(optimized_json.get("education", []))
        
        os.makedirs("static/resumes/final", exist_ok=True)
        pdf_path = f"static/resumes/final/generation_{generation_id}.pdf"
        
        pdf.output(pdf_path)
        return f"/{pdf_path}"

pdf_generator_service = PDFGeneratorService()
