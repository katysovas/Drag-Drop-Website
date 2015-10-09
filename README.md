# WeeblyProject
##Trial Weebly Project:

- Monday:  CSS/DOM
- Tuesday: Backbone Models & Views & MongoDB
- Wednesday: Drag&Drop and Editor
- Thursday: perf, caching, User login
- Friday: Cleaning code, QA & Beer


##All the things:

- Bootstrap 3.3.5
- jQuery 2.1.4
- jQuery UI 1.11.4
- jQuery Cookie 1.4.1
- Backbone.js 1.2.3
- Handlebars.js 4.0.3
- Backbone-MongoDB.js
- BackboneLocalStorage.js 1.1.16
- The Google+ platform.js
- MongoDB (mongolabs)


##The Good Things:

- The templates are pre-compiled and js files are minimized and built for CDN cashing
- Using cache to save some DB calls (partially works)

##The Bad Things:

- should use AWS or GridFS for storing images instead of data uri base64
- Site Grid doesn't work


##API Calls:
- Users https://api.mongolab.com/api/1/databases/pagedb/collections/users/?apiKey=
- Pages https://api.mongolab.com/api/1/databases/pagedb/collections/pages/?apiKey=


##MongoDB Sharding strategy:

3 shards to begin: using pagedb database with collection pages. The structure of the documents in pages is given below:
```
{
    "_id": {
        "$oid": "561710c2e4b03733bc09d259"
    },
    "title": "",
    "user_id": "",
    "dom": ""
}
```

Register the shards with mongos query router and provide the shard key:

sh.shardCollection("pagedb.pages", {"user_id" : 1})

After adding the pages, we would start seeing some chunks moving across the shards.

If we run sh.status(), we would see something like:
```
sharding version: {
  "_id" : 1,
  "version" : 4,
  "minCompatibleVersion" : 4,
  "currentVersion" : 5,
  "clusterId" : ObjectId("54cf95d9d9309193f5fa0780")
}
shards:
  {  "_id" : "shard0000",  "host" : "localhost:27012" }
  {  "_id" : "shard0001",  "host" : "localhost:27013" }
  {  "_id" : "shard0002",  "host" : "localhost:27014" }
databases:
  {  "_id" : "pagedb",  "partitioned" : true,  "primary" : "shard0000" }
    pagedb.pages
      shard key: { "user_id" : 1 }
      chunks:
          shard0001       1
          shard0002       1
          shard0000       1
      { "user_id" : { "$minKey" : 1 } } -->> { "user_id" : 200 } on : shard0001 Timestamp(2, 0)
      { "user_id" : 200 } -->> { "user_id" : 2096 } on : shard0002 Timestamp(3, 0)
      { "user_id" : 2096 } -->> { "user_id" : { "$maxKey" : 1 } } on : shard0000 Timestamp(3, 1)
```

The above output shows that the database pagedb is sharded and the sharded collection is the pages collection.
It also shows the different shards available and the range of shard keys distributed across different shards. So on shard0001 we have user_id from minimum to 200, then on shard0002 we have user_id from 200 upto 2096 and the rest in shard0000.
