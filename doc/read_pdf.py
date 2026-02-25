import pypdf
import sys

def extract_text(pdf_path):
    try:
        reader = pypdf.PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        with open("pdf_extracted_text.txt", "w", encoding="utf-8") as f:
            f.write(text)
        print("Text extracted successfully.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extract_text(r"docs proyecto\profe\Enunciado Proyecto Intermodular.pdf")
