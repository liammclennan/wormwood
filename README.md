Wormwood
========

> "The third angel sounded his trumpet, and a great star, blazing like a torch, fell from the sky on a third of the rivers and on the springs of water—the name of the star is Wormwood. A third of the waters turned bitter, and many people died from the waters that had become bitter." (so 1/9th of the waters?)

Wormwood is a trivial, SQL-ish, flat-file, schemaless, read-only database. It attempts to be the simplest possible implementation of standard database architectural ideas.  

To run wormwood
------

```shell
$ cd ts
$ npm i
$ npm start
```

To add data to wormwood
---------

Insert a file `<yourfilename>.clef` into the `/data` directory, containing newline delimeted JSON objects, like this:

```json
{"name":"One","i":1}
{"name":"Two","i":2}
{"name":"Three","i":3}
{"name":"Four","i":4}
{"name":"Five","i":5}
{"name":"Six","i":6}
```

then query your new data table:

```sql
select name,i from <yourfilename>
```

To create an index
-------------

Querying and indexing is only possible on expressions checking equality of a property to a constant. 

To create an index on the `country` property of the `offices` data table:

```sql
sp_createIndex(offices,country)
```

Henceforth, queries for `select country from offices where county = <constant>` will use the index to be slightly faster. 
