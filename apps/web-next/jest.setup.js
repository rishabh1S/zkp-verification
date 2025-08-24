import { jest } from "@jest/globals"
import "@testing-library/jest-dom"

// Mock IndexedDB
const FDBFactory = require("fake-indexeddb/lib/FDBFactory")
const FDBKeyRange = require("fake-indexeddb/lib/FDBKeyRange")

global.indexedDB = new FDBFactory()
global.IDBKeyRange = FDBKeyRange

// Mock Web3 wallet
global.ethereum = {
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
}

// Mock file reader
global.FileReader = class {
  readAsDataURL = jest.fn(() => {
    this.onload({ target: { result: "data:image/png;base64,mock" } })
  })
  readAsArrayBuffer = jest.fn(() => {
    this.onload({ target: { result: new ArrayBuffer(8) } })
  })
}

// Mock QR scanner
jest.mock("qr-scanner", () => ({
  default: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    destroy: jest.fn(),
  })),
}))
