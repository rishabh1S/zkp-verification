import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { WalletConnect } from "@/components/wallet/wallet-connect"
import { WalletAuthProvider } from "@/components/auth/auth-provider"
import jest from "jest" // Declare the jest variable

// Mock wagmi hooks
jest.mock("wagmi", () => ({
  useAccount: () => ({ address: null, isConnected: false }),
  useConnect: () => ({
    connect: jest.fn(),
    connectors: [{ id: "metamask", name: "MetaMask" }],
  }),
  useDisconnect: () => ({ disconnect: jest.fn() }),
}))

const MockedWalletConnect = () => (
  <WalletAuthProvider>
    <WalletConnect />
  </WalletAuthProvider>
)

describe("WalletConnect", () => {
  it("renders connect button when not connected", () => {
    render(<MockedWalletConnect />)
    expect(screen.getByText("Connect Wallet")).toBeInTheDocument()
  })

  it("shows wallet options when connect is clicked", async () => {
    render(<MockedWalletConnect />)
    fireEvent.click(screen.getByText("Connect Wallet"))

    await waitFor(() => {
      expect(screen.getByText("MetaMask")).toBeInTheDocument()
    })
  })
})
