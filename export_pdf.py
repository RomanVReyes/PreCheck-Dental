import os
import re
from reportlab.platypus import SimpleDocTemplate, Paragraph, Preformatted, Spacer
from reportlab.lib.styles import getSampleStyleSheet

# Extensiones que quieres incluir
EXTENSIONS = (".js", ".html", ".css", ".md")

# Función para eliminar comentarios
def remove_comments(code, ext):
    if ext == ".js":
        code = re.sub(r"//.*", "", code)  # comentarios de línea
        code = re.sub(r"/\*.*?\*/", "", code, flags=re.DOTALL)  # bloques
    elif ext == ".css":
        code = re.sub(r"/\*.*?\*/", "", code, flags=re.DOTALL)
    elif ext == ".html":
        code = re.sub(r"<!--.*?-->", "", code, flags=re.DOTALL)
    return code

def get_all_files(root):
    files = []
    for folder, _, filenames in os.walk(root):
        for f in filenames:
            if f.endswith(EXTENSIONS):
                files.append(os.path.join(folder, f))
    return sorted(files)

def generate_pdf(root_folder, output="codigo_precheck.pdf"):
    doc = SimpleDocTemplate(output)
    styles = getSampleStyleSheet()
    elements = []

    files = get_all_files(root_folder)

    for file in files:
        ext = os.path.splitext(file)[1]

        with open(file, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        content = remove_comments(content, ext)

        # Título del archivo
        elements.append(Paragraph(f"<b>{file}</b>", styles["Heading3"]))
        elements.append(Spacer(1, 10))

        # Código formateado
        elements.append(Preformatted(content, styles["Code"]))
        elements.append(Spacer(1, 20))

    doc.build(elements)

if __name__ == "__main__":
    generate_pdf(".")