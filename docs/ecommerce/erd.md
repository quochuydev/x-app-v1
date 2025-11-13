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
		datetime createdDate  ""
		datetime updatedDate  ""
		datetime deletedAt  ""
	}
	cartItem {
		uuid id PK ""
		string productId FK ""
		string price  ""
		number quantity  ""
		float totalPrice  ""
		datetime createdDate  ""
		datetime updatedDate  ""
	}
	cart {
		uuid id PK ""
		uuid userId FK ""
		number amount  ""
		datetime createdDate  ""
		datetime updatedDate  ""
	}
	orderItem {
		uuid id UK ""
		int quantity  ""
		float price  ""
		string productId FK ""
		string orderId FK ""
		datetime createdDate  ""
		datetime updatedDate  ""
	}
	file {
		uuid id PK ""
		string name  ""
		string url  ""
		datetime createdDate  ""
		datetime updatedDate  ""
	}
	order {
		uuid id PK ""
		string status  "new/processing/cancelled/shipped"
		string paymentStatus  "unpaid/paid/refunded"
		float amount  ""
		string userId  ""
		datetime createdDate  ""
		datetime updatedDate  ""
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
		datetime createdDate  ""
	}
	category {
		uuid id PK ""
		string name  ""
		datetime createdDate  ""
	}
	product {
		uuid id PK ""
		string name  ""
		string description  ""
		float price  ""
		uuid categoryId  ""
		datetime createdDate  ""
		datetime updatedDate  ""
	}
	transaction {
		uuid id PK ""
		uuid orderId FK ""
		number amount  ""
		datetime createdDate  ""
		string status  "processing / success / failed"
	}
	blog {
		uuid id PK ""
		string title  ""
		string body  ""
		uuid userId  ""
		uuid thumbnailId FK ""
		datetime createdDate  ""
		datetime updatedDate  ""
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
