;; ---------------------------------------------------------
;; --- NFT Marketplace Contract
;; ---
;; --- This contract allows users to list and buy/sell NFTs
;; --- from any collection that follows the SIP-009 standard.
;; ---------------------------------------------------------

;; Import the NFT trait
(use-trait nft-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

;; --- Constants and Variables
(define-constant CONTRACT-OWNER tx-sender) ;; Contract owner, receives commission fees.
(define-constant COMMISION-RATE u5) ;; Commission rate is 5%. (5 / 100)

;; --- Error codes
(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant ERR-NFT-NOT-LISTED (err u403))
(define-constant ERR-INVALID-PRICE (err u404))
(define-constant ERR_UNAUTHORISED (err u2001))
(define-constant ERR_PRICE_ZERO (err u1001))
(define-constant ERR_NFT_NOT_WHITELISTED (err u1002))
(define-constant ERR_LISTING_NOT_FOUND (err u1003))
(define-constant ERR_MAKER_TAKER_EQUAL (err u1004))
(define-constant ERR_UNINTENDED_TAKER (err u1005))
(define-constant ERR_ASSET_CONTRACT_NOT_WHITELISTED (err u2007))
(define-constant ERR_PAYMENT_CONTRACT_NOT_WHITELISTED (err u1007))
(define-constant ERR_UNKNOWN_LISTING (err u2000))
(define-constant ERR_MAKER_TAKER_EQUAL_TEST (err u2005))
(define-constant ERR_NFT_ASSET_MISMATCH (err u2003))
(define-constant ERR_LISTING_EXPIRED (err u2002))

;; Data variables
(define-data-var listing-nonce uint u0)

;; Maps
(define-map whitelisted-nft-contracts principal bool)
(define-map listings uint {
  maker: principal,
  nft-asset-contract: principal,
  token-id: uint,
  expiry: uint,
  price: uint,
  taker: (optional principal),
  payment-asset-contract: (optional principal)
})

;; ---------------------------------------------------------
;; --- Public Functions
;; ---------------------------------------------------------

;; @desc Set whitelist status for NFT contracts
(define-public (set-whitelisted (nft-asset-contract principal) (whitelisted bool))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR_UNAUTHORISED)
    (ok (map-set whitelisted-nft-contracts nft-asset-contract whitelisted))
  )
)

;; @desc List an asset for sale
(define-public (list-asset (nft-asset-contract <nft-trait>) (nft-asset {taker: (optional principal), token-id: uint, expiry: uint, price: uint, payment-asset-contract: (optional principal)}))
  (let
    (
      (listing-id (var-get listing-nonce))
      (expiry (get expiry nft-asset))  ;; Use the expiry from input directly
      (maker tx-sender)
      (taker (get taker nft-asset))
      (token-id (get token-id nft-asset))
      (price (get price nft-asset))
      (payment-asset-contract (get payment-asset-contract nft-asset))
    )
    (asserts! (> price u0) ERR_PRICE_ZERO)
    (asserts! (default-to true (map-get? whitelisted-nft-contracts (contract-of nft-asset-contract))) ERR_ASSET_CONTRACT_NOT_WHITELISTED)
    
    ;; Transfer NFT to this contract
    (try! (contract-call? nft-asset-contract transfer token-id maker (as-contract tx-sender)))
    
    ;; Create listing
    (map-set listings listing-id {
      maker: maker,
      nft-asset-contract: (contract-of nft-asset-contract),
      token-id: token-id,
      expiry: expiry,
      price: price,
      taker: taker,
      payment-asset-contract: payment-asset-contract
    })
    
    (var-set listing-nonce (+ listing-id u1))
    (ok listing-id)
  )
)

;; @desc Cancel a listing
(define-public (cancel-listing (listing-id uint) (nft-asset-contract <nft-trait>))
  (let
    (
      (listing (unwrap! (map-get? listings listing-id) ERR_UNKNOWN_LISTING))
      (maker (get maker listing))
    )
    (asserts! (is-eq tx-sender maker) ERR_UNAUTHORISED)
    ;; Check if the NFT asset contract matches the listing
    (asserts! (is-eq (contract-of nft-asset-contract) (get nft-asset-contract listing)) ERR_NFT_ASSET_MISMATCH)
    
    ;; Transfer NFT back to maker
    (try! (as-contract (contract-call? nft-asset-contract transfer (get token-id listing) (as-contract tx-sender) maker)))
    
    ;; Remove listing
    (map-delete listings listing-id)
    (ok true)
  )
)

;; @desc Fulfill a listing with STX
(define-public (fulfil-listing-stx (listing-id uint) (nft-asset-contract <nft-trait>))
  (let
    (
      (listing (unwrap! (map-get? listings listing-id) ERR_UNKNOWN_LISTING))
      (taker tx-sender)
      (maker (get maker listing))
      (price (get price listing))
      (token-id (get token-id listing))
      (expiry (get expiry listing))
    )
    ;; Check if the NFT asset contract matches the listing
    (asserts! (is-eq (contract-of nft-asset-contract) (get nft-asset-contract listing)) ERR_NFT_ASSET_MISMATCH)
    
    ;; Check if listing has expired
    (asserts! (< stacks-block-height expiry) ERR_LISTING_EXPIRED)
    
    (asserts! (not (is-eq taker maker)) ERR_MAKER_TAKER_EQUAL_TEST)
    
    ;; Check if specific taker was set
    (match (get taker listing)
      specific-taker (asserts! (is-eq taker specific-taker) ERR_UNINTENDED_TAKER)
      true ;; No specific taker, anyone can fulfill
    )
    
    ;; Transfer STX from taker to maker
    (try! (stx-transfer? price taker maker))
    
    ;; Transfer NFT from contract to taker
    (try! (as-contract (contract-call? nft-asset-contract transfer token-id (as-contract tx-sender) taker)))
    
    ;; Remove listing
    (map-delete listings listing-id)
    (ok listing-id)
  )
)

;; ---------------------------------------------------------
;; --- Read-Only Functions
;; ---------------------------------------------------------

;; @desc Get listing information for a specific listing ID
(define-read-only (get-listing (listing-id uint))
  (map-get? listings listing-id)
)

;; @desc Check if NFT contract is whitelisted
(define-read-only (is-whitelisted (nft-asset-contract principal))
  (default-to false (map-get? whitelisted-nft-contracts nft-asset-contract))
)

;; @desc Get current listing nonce
(define-read-only (get-listing-nonce)
  (var-get listing-nonce)
)
