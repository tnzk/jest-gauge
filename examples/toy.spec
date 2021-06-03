# Search specification
Tags: search, admin

The admin user must be able to search for available products on the search page

From: https://docs.gauge.org/writing-specifications.html?os=macos&language=javascript&ide=vscode

* A context step

|id| role       |
|--|------------|
|1 | customer   |
|2 | admin      |
|3 | superviser |

## Successful search
Tags: successful

For an existing product name, the search result will contain the product name

* User must be logged in as <role>
* Open the product search page
* Search for product "Cup Cakes"
* A step without corresponding implementation
* "Cup Cakes" should show up in the search results


## Unsuccessfull search
Tags: test, draft

On an unknown product name search the search results will be empty

* User must be logged in as "admin"
* Open the product search page
* Search for product "unknown"
* The search results will be empty

___

* Teardown step 1
* Teardown step 2