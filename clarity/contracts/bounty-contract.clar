;; ---------------------------------------------------------
;; --- Simple Bounty Contract
;; ---
;; --- Author: d3f4ult
;; --- Version: 1.0
;; ---------------------------------------------------------

;; --- Error constants
(define-constant ERR_BOUNTY_NOT_FOUND (err u100))
(define-constant ERR_UNAUTHORIZED (err u101))
(define-constant ERR_BOUNTY_NOT_OPEN (err u102))
(define-constant ERR_BOUNTY_ALREADY_IN_PROGRESS (err u103))
(define-constant ERR_NO_SUBMISSION_TO_APPROVE (err u104))
(define-constant ERR_INVALID_AMOUNT (err u106))

;; --- Data Storage
(define-data-var bounty-counter uint u0)

(define-map bounties uint {
  creator: principal,
  amount: uint,
  description: (string-ascii 256),
  status: (string-ascii 12), ;; "open", "in-progress", "completed", "cancelled"
  submitter: (optional principal),
  submission: (optional (string-ascii 256))
})

;; ---------------------------------------------------------
;; --- Read-Only Functions
;; ---------------------------------------------------------

(define-read-only (get-bounty (id uint))
  (map-get? bounties id)
)

(define-read-only (get-bounty-count)
  (ok (var-get bounty-counter))
)

;; ---------------------------------------------------------
;; --- Public Functions
;; ---------------------------------------------------------

(define-public (create-bounty (description (string-ascii 256)) (amount uint))
  (begin
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (let
      ((bounty-id (+ (var-get bounty-counter) u1))
       (creator tx-sender))
      (try! (stx-transfer? amount creator (as-contract tx-sender)))
      (map-set bounties bounty-id {
        creator: creator,
        amount: amount,
        description: description,
        status: "open",
        submitter: none,
        submission: none
      })
      (var-set bounty-counter bounty-id)
      (ok bounty-id)
    )
  )
)

(define-public (submit-work (id uint) (submission (string-ascii 256)))
  (let
    ((bounty (unwrap! (map-get? bounties id) ERR_BOUNTY_NOT_FOUND)))
    (asserts! (is-eq (get status bounty) "open") ERR_BOUNTY_NOT_OPEN)
    (map-set bounties id
      (merge bounty {
        status: "in-progress",
        submitter: (some tx-sender),
        submission: (some submission)
      })
    )
    (ok true)
  )
)

(define-public (approve-submission (id uint))
  (let
    ((bounty (unwrap! (map-get? bounties id) ERR_BOUNTY_NOT_FOUND))
     (creator (get creator bounty))
     (worker (unwrap! (get submitter bounty) ERR_NO_SUBMISSION_TO_APPROVE))
     (amount (get amount bounty)))
    (asserts! (is-eq tx-sender creator) ERR_UNAUTHORIZED)
    (asserts! (is-eq (get status bounty) "in-progress") ERR_BOUNTY_ALREADY_IN_PROGRESS)
    (try! (as-contract (stx-transfer? amount (as-contract tx-sender) worker)))
    (map-set bounties id
      (merge bounty { status: "completed" })
    )
    (ok true)
  )
)

(define-public (cancel-bounty (id uint))
  (let
    ((bounty (unwrap! (map-get? bounties id) ERR_BOUNTY_NOT_FOUND))
     (creator (get creator bounty))
     (amount (get amount bounty)))
    (asserts! (is-eq tx-sender creator) ERR_UNAUTHORIZED)
    (asserts! (is-eq (get status bounty) "open") ERR_BOUNTY_NOT_OPEN)
    (try! (as-contract (stx-transfer? amount (as-contract tx-sender) creator)))
    (map-set bounties id
      (merge bounty { status: "cancelled" })
    )
    (ok true)
  )
)
