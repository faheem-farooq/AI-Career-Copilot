from pypdf import PdfReader
import tempfile


async def extract_text_from_pdf(file):

    with tempfile.NamedTemporaryFile(delete=False) as temp_file:

        content = await file.read()

        temp_file.write(content)

        temp_path = temp_file.name

    reader = PdfReader(temp_path)

    text = ""

    for page in reader.pages:

        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"

    return text