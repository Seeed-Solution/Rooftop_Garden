import cssText from "./index.scss";
import {
	useConnectMPIframe,
	useGetMatterTagData,
	useMatterTagLoading,
	useWatchCameraPos,
	useGetMatterTagPos,
	getGroupDevices,
	getDevicesChannels,
	getDeviceData,
	getDevicesInfo,
	getMeasurementData,
	getSensorTypeName,
	useGetMatterTag,
} from "../utils/hooks.js";
import MattertagInject from "./components/MattertagInject";
import { GROUP_UUID, SID_EUI_MAPPING, DEVICE_UPDATE_GAP } from "./config";

function main() {
	new Vue({
		components: MattertagInject(),
		data() {
			return {
				mpSdk: null,
				mpTags: null,
				devices: [],
				activeSid: "",
				activeTag: null,
				cameraPos: null,
				// iframeLink:'',
				iframeLink: `https://my.matterport.com/show?m=${import.meta.env.V__MP_MODEL_KEY}&hr=0&play=1&title=0&qs=1&newtags=0`,
			};
		},

		methods: {
			async updateDeviceData(eui) {
				let idx = this.devices.findIndex((d) => d.eui === eui);
				if (idx === -1) return Promise.reject(null);
				let device = this.devices[idx];
				let now = new Date().getTime();
				if (device.lastData && device.lastUpdateTime && now - device.lastUpdateTime < DEVICE_UPDATE_GAP) {
					return Promise.resolve(device);
				}
				let data;
				try {
					data = await getDeviceData(eui);
				} catch (err) {
					console.log(err);
					device.lastData = null;
					this.devices.splice(idx, 1, device);
					return Promise.resolve(device);
				}
				device.lastData = data;
				device.lastUpdateTime = new Date().getTime();
				this.devices.splice(idx, 1, device);
				return Promise.resolve(device);
			},

			async updateActiveTag(sid) {
				if (!sid) return;
				this.activeSid = sid;
				let device,
					now = new Date().getTime();
				let currentTag = this.mpTags.find((t) => t.sid === sid);
				let eui = SID_EUI_MAPPING[sid];
				// if(!eui) { await this.mpSdk.Mattertag.editBillboard(sid, {description : 'No Device',/* , label : '' */}); return };
				if (!currentTag.eui && SID_EUI_MAPPING[sid]) {
					currentTag.eui = SID_EUI_MAPPING[sid];
				}
				// await useMatterTagLoading(this.mpSdk, sid, TAG_LOADING_IMG)
				// await useMatterTagLoading(this.mpSdk, sid, '');

				try {
					// await this.mpSdk.Mattertag.editBillboard(sid, {description : 'Loading...'});
					device = await this.updateDeviceData(eui);
					if (!device.lastData) {
						// await this.mpSdk.Mattertag.editBillboard(sid, {description : 'No Data',/* , label : '' */});
					}
				} catch (err) {
					console.log(err);
					// await this.mpSdk.Mattertag.editBillboard(sid, {description : 'No Data',/* , label : '' */});
					return;
				}
				// await this.mpSdk.Mattertag.editBillboard(sid, {description : ''/* , label : '' */});
				if (this.activeSid !== sid) {
					return;
				}
				currentTag.deviceData = device.lastData;
				currentTag.device_name = device.device_name || device.sensor_name;
				currentTag.sensor_name = device.sensor_name;
				currentTag.lastUpdateTime = new Date().getTime();
				this.activeTag = currentTag;
			},

			async initMattportView() {
				let mpSdk = await useConnectMPIframe(this.$refs.$scene);
				this.mpTags = await useGetMatterTagData(mpSdk);
				this.mpSdk = mpSdk;
				this.updateActiveTag(this.mpTags[0].sid);
				mpSdk.on("tag.hover", (sid) => {
					console.log(sid);
					this.updateActiveTag(sid);
				});
			},

			async initDevices() {
				let data = {};
				let devices, euis, details, channels;
				try {
					await getMeasurementData();
					devices = await getGroupDevices(GROUP_UUID);
					euis = devices.map((t) => t.device_eui);
					details = await getDevicesInfo(euis);
					channels = await getDevicesChannels(euis);
				} catch (err) {
					return;
				}
				details.forEach((item, idx) => {
					data[item.device_eui] = item;
				});
				let arr = channels.map((item, idx) => {
					let t = {};
					let { device_eui, channels } = item;
					if (!data[device_eui]) {
						data[device_eui] = {};
					}
					if (channels.length > 0) {
						data[device_eui]["eui"] = device_eui;
						data[device_eui]["channel"] = channels[0];
						data[device_eui]["sensor_name"] = getSensorTypeName(data[device_eui]["channel"].sensor_type);
					}
					return data[device_eui];
				});
				this.devices = arr;
			},
		},
		created() {
			this.initDevices();
		},
		mounted() {
			this.$refs.$scene.addEventListener("load", () => {
				this.initMattportView();
			});
		},
	}).$mount("#app");
}
main();
