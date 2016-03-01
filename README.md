# Usage

```
node app.js url [options]
```


# Options

```--folder``` 				- destination folder (default: ./)

```--start-index, -s``` 	- starting index in playlist (default: 1)



# Example 

```
# to download all videos in playlist use:
node app.js https://www.youtube.com/playlist?list=PLCAM4-OTb6rm7Ef6yeXlk8829Mj22HalZ --folder=./movies/

# this playlist contains 44 videos. To download 42-44 videos use:
node app.js https://www.youtube.com/playlist?list=PLCAM4-OTb6rm7Ef6yeXlk8829Mj22HalZ --folder=./movies/ -s 42
```
