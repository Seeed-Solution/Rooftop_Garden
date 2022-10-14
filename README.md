# Rooftop_Garde 
Turn Rooftop Garden into a digital twin with the smart device in your pocket.


## Add .env file 
```
  V__ACCESS_API_ID=API_ID
  V__ACCESS_API_KEY=Access_API_keys
  V__GROUP_UUID=Deivice Group Id
  V__BASE_URL="https://sensecap.seeed.cc/openapi"


  V__MP_MODEL_KEY= Your_Matterport_Project_ID
  V__MP_SDK_KEY=YOUR_SDK_KEY_HERE
```

## Config `matterport/config.js`

```javascript
export const GROUP_UUID = "YOUR_DEVICE_GROUP_UUID";
// TagID & DeviceID Mapping
export const SID_EUI_MAPPING = {
	"MATTERPORT_TAG_ID": "YOUR_DEVICE_ID",
};
export const DEVICE_UPDATE_GAP = 1000 * 10;
```

## Run project with Vite server 
``` npm run dev```

- Matterport SDK 
  https://matterport.github.io/showcase-sdk/docs/reference/current/index.html
- SDK for Embeds
  https://matterport.github.io/showcase-sdk/sdk_home.html
