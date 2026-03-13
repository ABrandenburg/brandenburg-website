"use client"

import { useState, useRef } from "react"
import type { EmailSignaturePerson } from "@/lib/email-signature-data"

interface EmailSignatureDisplayProps {
  person: EmailSignaturePerson
}

export function EmailSignatureDisplay({ person }: EmailSignatureDisplayProps) {
  const [copied, setCopied] = useState(false)
  const signatureRef = useRef<HTMLDivElement>(null)

  const handleCopy = () => {
    if (!signatureRef.current) return

    const range = document.createRange()
    range.selectNodeContents(signatureRef.current)
    const selection = window.getSelection()
    if (!selection) return
    selection.removeAllRanges()
    selection.addRange(range)

    document.execCommand("copy")
    selection.removeAllRanges()

    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div>
      <div
        ref={signatureRef}
        style={{ padding: "16px", background: "#ffffff" }}
      >
        <table
          cellPadding="0"
          cellSpacing="0"
          style={{
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: "14px",
            color: "#333333",
            lineHeight: "1.4",
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  verticalAlign: "top",
                  paddingRight: "16px",
                }}
              >
                <img
                  src="https://www.brandenburgplumbing.com/images/Brandenburg%20Logo_Dark_Red%20Mark-01.png"
                  alt="Brandenburg Plumbing"
                  width="100"
                  style={{
                    width: "100px",
                    height: "auto",
                    display: "block",
                  }}
                />
              </td>
              <td style={{ verticalAlign: "top" }}>
                <table cellPadding="0" cellSpacing="0">
                  <tbody>
                    <tr>
                      <td
                        style={{
                          fontSize: "16px",
                          fontWeight: "bold",
                          color: "#324759",
                          fontFamily: "Arial, Helvetica, sans-serif",
                          paddingBottom: "2px",
                        }}
                      >
                        {person.name}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          fontSize: "13px",
                          color: "#C41E3A",
                          fontFamily: "Arial, Helvetica, sans-serif",
                          paddingBottom: "8px",
                        }}
                      >
                        {person.position}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div
                          style={{
                            borderTop: "2px solid #C41E3A",
                            marginBottom: "8px",
                            width: "40px",
                          }}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          fontSize: "13px",
                          fontFamily: "Arial, Helvetica, sans-serif",
                          color: "#333333",
                          paddingBottom: "2px",
                        }}
                      >
                        {person.phone}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          fontSize: "13px",
                          fontFamily: "Arial, Helvetica, sans-serif",
                          paddingBottom: "2px",
                        }}
                      >
                        <a
                          href={`mailto:${person.email}`}
                          style={{ color: "#324759", textDecoration: "none" }}
                        >
                          {person.email}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          fontSize: "13px",
                          fontFamily: "Arial, Helvetica, sans-serif",
                          paddingBottom: "6px",
                        }}
                      >
                        <a
                          href="https://www.brandenburgplumbing.com"
                          style={{ color: "#324759", textDecoration: "none" }}
                        >
                          www.brandenburgplumbing.com
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          fontSize: "13px",
                          fontFamily: "Arial, Helvetica, sans-serif",
                          color: "#333333",
                        }}
                      >
                        <a
                          href="https://www.instagram.com/brandenburgplumbing/"
                          style={{ color: "#324759", textDecoration: "none" }}
                        >
                          Instagram
                        </a>
                        <span style={{ color: "#999999", padding: "0 6px" }}>|</span>
                        <a
                          href="https://www.facebook.com/BrandenburgPlumbing/"
                          style={{ color: "#324759", textDecoration: "none" }}
                        >
                          Facebook
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "24px" }}>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-opacity-90"
        >
          {copied ? "Copied!" : "Copy Signature"}
        </button>
        {copied && (
          <span className="ml-3 text-sm text-green-600">
            Signature copied — paste it into your Gmail signature settings.
          </span>
        )}
      </div>
    </div>
  )
}
