import { fireEvent, render } from "@testing-library/react";
import { vi } from "vitest";
import { FileDropzone } from "@/components/auth/FileDropzone";

describe("FileDropzone", () => {
  it("accepts PDF files and forwards them", () => {
    const handleSelect = vi.fn();
    const { container } = render(<FileDropzone file={null} onFileSelect={handleSelect} />);

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["test"], "cv.pdf", { type: "application/pdf" });

    fireEvent.change(input, { target: { files: [file] } });

    expect(handleSelect).toHaveBeenCalledWith(file);
  });

  it("rejects non PDF files", () => {
    const handleSelect = vi.fn();
    const { container, getByText } = render(
      <FileDropzone file={null} onFileSelect={handleSelect} />
    );

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["test"], "cv.docx", { type: "application/vnd.openxmlformats" });

    fireEvent.change(input, { target: { files: [file] } });

    expect(handleSelect).toHaveBeenLastCalledWith(null);
    expect(getByText(/doit être un PDF/i)).toBeInTheDocument();
  });
});
