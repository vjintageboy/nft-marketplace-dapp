;; ---------------------------------------------------------
;; --- NFT Collection Contract: Funny Dog
;; ---
;; --- This contract defines an NFT collection following the SIP-009 standard.
;; --- It manages minting, transfer, and ownership of NFTs.
;; ---------------------------------------------------------

;; Import the NFT trait
(use-trait nft-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

;; Inherit functions from the standard NFT trait.
(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

;; Define a new non-fungible token named 'funny-dog' with uint ID.
(define-non-fungible-token funny-dog uint)

;; --- Constants and Variables
(define-constant CONTRACT-OWNER tx-sender) ;; Contract owner, the deployer.
(define-constant ERR-NOT-AUTHORIZED (err u401)) ;; Error: Not authorized.

;; Variable to track the ID of the last token created.
(define-data-var last-token-id uint u0)
;; Base URL to get NFT metadata (images).
(define-data-var base-uri (string-ascii 256) "https://example.com/api/dogs/") ;; TODO: Replace with your actual URL

;; ---------------------------------------------------------
;; --- Public Functions
;; ---------------------------------------------------------

;; @desc Transfer an NFT from sender to recipient.
;; @param token-id ID of the NFT to transfer.
;; @param sender Current owner.
;; @param recipient New recipient.
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    ;; Only the NFT owner can transfer it.
    (asserts! (is-eq tx-sender sender) ERR-NOT-AUTHORIZED)
    ;; Execute the NFT transfer.
    (nft-transfer? funny-dog token-id sender recipient)
  )
)

;; @desc "Mint" a new NFT for a specified recipient.
;; @param to Principal address to receive the NFT.
(define-public (mint (to principal))
  (let
    (
      ;; Create ID for new token by taking last ID + 1.
      (token-id (+ u1 (var-get last-token-id)))
    )
    ;; Mint new NFT and assign ownership to specified recipient.
    (try! (nft-mint? funny-dog token-id to))
    ;; Update the last token ID.
    (var-set last-token-id token-id)
    (ok token-id)
  )
)

;; ---------------------------------------------------------
;; --- Read-Only Functions
;; ---------------------------------------------------------

;; @desc Get the ID of the last token created.
(define-read-only (get-last-token-id)
  (ok (var-get last-token-id))
)

;; @desc Get the wallet address of the owner of a specific NFT.
;; @param token-id ID of the NFT to check.
(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? funny-dog token-id))
)

;; @desc Get the URI (path) to the metadata of an NFT.
;; @param token-id ID of the NFT.
(define-read-only (get-token-uri (token-id uint))
  ;; Return base URI - in production, you would implement proper token ID to string conversion
  (ok (some (var-get base-uri)))
)
