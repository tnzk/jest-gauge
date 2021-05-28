# Search specification
Tags: search, admin

The admin user must be able to search for available products on the search page

From: https://docs.gauge.org/writing-specifications.html?os=macos&language=javascript&ide=vscode

## Successful search
Tags: successful

For an existing product name, the search result will contain the product name

* User must be logged in as "admin"
* Open the product search page
* Search for product "Cup Cakes"
* "Cup Cakes" should show up in the search results


## Unsuccessfull search
Tags: test

On an unknown product name search the search results will be empty

* User must be logged in as "admin"
* Open the product search page
* Search for product "unknown"
* The search results will be empty
