# Usage

```
node app.js url [options]
```


# Options

```--dst, -d``` 				- destination folder (default: ./)

```--first-index, -f``` 	- index of first video to download (default: 1)

```--last-index, -l``` 	- index of last video to download (default: last index in playlist)

```--streams, -s``` 	- number of download streams (default: 1)



# Example 

```
# to download all videos in playlist use:
node app.js https://www.youtube.com/playlist?list=PLCAM4-OTb6rm7Ef6yeXlk8829Mj22HalZ --dst=./movies/

# this playlist contains 43 videos. To download videos #20-#30 use:
node app.js https://www.youtube.com/playlist?list=PLCAM4-OTb6rm7Ef6yeXlk8829Mj22HalZ --dst=./movies/ -f 20 -l 30
```
