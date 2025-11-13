```mermaid
---
config:
  layout: elk
---
erDiagram
	direction TB
	user {
		uuid id PK ""
		string firstName  ""
		string lastName  ""
		string role  "admin/user/customer"
		datetime createdAt  ""
		datetime updatedAt  ""
		datetime deletedAt  ""
	}
	cartItem {
		uuid id PK ""
		string productId FK ""
		string price  ""
		number quantity  ""
		float totalPrice  ""
		datetime createdAt  ""
		datetime updatedAt  ""
	}
	cart {
		uuid id PK ""
		uuid userId FK ""
		number amount  ""
		datetime createdAt  ""
		datetime updatedAt  ""
	}
	orderItem {
		uuid id UK ""
		int quantity  ""
		float price  ""
		string productId FK ""
		string orderId FK ""
		datetime createdAt  ""
		datetime updatedAt  ""
	}
	file {
		uuid id PK ""
		string name  ""
		string url  ""
		datetime createdAt  ""
		datetime updatedAt  ""
	}
	order {
		uuid id PK ""
		string status  "new/processing/cancelled/shipped"
		string paymentStatus  "unpaid/paid/refunded"
		float amount  ""
		string userId  ""
		datetime createdAt  ""
		datetime updatedAt  ""
	}
	inventory {
		uuid id PK ""
		uuid productId FK ""
		uuid warehouseId FK ""
		number quantity  ""
	}
	comment {
		uuid id PK ""
		uuid blogId FK ""
		uuid userid FK ""
		string content  ""
	}
	review {
		uuid id PK ""
		uuid orderId FK ""
		uuid userId FK ""
	}
	warehouse {
		uuid id PK ""
		string name  ""
		string address  ""
	}
	refundRequest {
		uuid id PK ""
		uuid orderId FK ""
		uuid approverId FK ""
		datetime createdAt  ""
	}
	category {
		uuid id PK ""
		string name  ""
		datetime createdAt  ""
	}
	product {
		uuid id PK ""
		string name  ""
		string description  ""
		float price  ""
		uuid categoryId  ""
		datetime createdAt  ""
		datetime updatedAt  ""
	}
	transaction {
		uuid id PK ""
		uuid orderId FK ""
		number amount  ""
		datetime createdAt  ""
		string status  "processing / success / failed"
	}
	blog {
		uuid id PK ""
		string title  ""
		string body  ""
		uuid userId  ""
		uuid thumbnailId FK ""
		datetime createdAt  ""
		datetime updatedAt  ""
	}

	order||--|{orderItem:"  "
	product||--|{orderItem:"  "
	cart||--|{cartItem:"  "
	product}|--||cartItem:"  "
	product}|--|{file:"  "
	inventory}|--|{warehouse:"  "
	product}|--|{inventory:"  "
	order||--|{review:"  "
	blog||--|{comment:"  "
	user||--|{comment:"  "
	user}|--|{review:"  "
	order||--|{refundRequest:"  "
	order}|--|{transaction:"  "
	product}|--|{category:"  "
	user||--|{refundRequest:"  "
	blog}|--|{file:"  "
	user||--|{cart:"  "
```
