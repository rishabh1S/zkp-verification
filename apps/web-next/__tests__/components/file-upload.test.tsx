import { render, screen, fireEvent } from "@testing-library/react"
import { FileUpload } from "@/components/upload/file-upload"
import jest from "jest"

describe("FileUpload", () => {
  const mockOnFileSelect = jest.fn()

  beforeEach(() => {
    mockOnFileSelect.mockClear()
  })

  it("renders upload area", () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} />)
    expect(screen.getByText(/drag and drop/i)).toBeInTheDocument()
  })

  it("handles file selection", async () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} />)

    const file = new File(["test"], "test.pdf", { type: "application/pdf" })
    const input = screen.getByLabelText(/choose file/i)

    fireEvent.change(input, { target: { files: [file] } })

    expect(mockOnFileSelect).toHaveBeenCalledWith(file)
  })

  it("validates file types", () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} acceptedTypes={["pdf"]} />)

    const file = new File(["test"], "test.txt", { type: "text/plain" })
    const input = screen.getByLabelText(/choose file/i)

    fireEvent.change(input, { target: { files: [file] } })

    expect(screen.getByText(/file type not supported/i)).toBeInTheDocument()
  })
})
