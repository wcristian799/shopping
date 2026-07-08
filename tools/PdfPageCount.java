import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfReader;

public class PdfPageCount {
    public static void main(String[] args) throws Exception {
        for (String path : args) {
            try (PdfDocument pdf = new PdfDocument(new PdfReader(path))) {
                System.out.println(path + "=" + pdf.getNumberOfPages());
            }
        }
    }
}
