import matterTagStyle from "../mattertag.scss";
const MattertagInject = () => {
	const MSG = {
		UPDATE_CONTENT: "UPDATE_CONTENT",
		LOADING: "LOADING",
		FINISHED: "FINISHED",
	};

	return Vue.component("MattertagInject", {
		name: "MattertagInject",
		template: document.getElementById("Mattertag_Component").outerHTML,
		data() {
			return {
				msger: null,
			};
		},
		props: {
			mpSdk: {
				type: Object,
				default: null,
			},
			sid: "",
			t: 0,
			eui: "",
			isLoading: false,
		},
		methods: {
			getInjectContent(hasStyle, hasScript) {
				let $container = this.$refs["container"];
				if (!(this.mpSdk && this.mpSdk.Mattertag && this.sid && $container)) return;
				let size = {
					w: $container.offsetWidth + 20,
					h: $container.offsetHeight + 20,
				};

				let injectCssText = !hasStyle ? "" : `<style>${matterTagStyle}</style>`;
				let injectScript = !hasScript
					? ""
					: `
                    <script>
                        window.on('${MSG.UPDATE_CONTENT}', (data) => {
                            let {injectHtmlContext,size} = data;
                            let $wrap = document.getElementById('MTG_INJECT');
                            if($wrap){$wrap.innerHTML = injectHtmlContext}
                        });
                    </script>`;
				let injectHtmlContext = $container.outerHTML + injectCssText + injectScript;
				return {
					injectHtmlContext,
					size,
				};
			},

			async updateInjectContent() {
				try {
					let { injectHtmlContext, size } = this.getInjectContent(true, true);
					this.size = size;
					this.msger = await this.mpSdk.Mattertag.injectHTML(this.sid, injectHtmlContext, { size });
					this.lastInjectSid = this.sid;
				} catch (err) {
					console.warn(err);
				}
			},
			updateContent() {
				if (!this.msger) return;
				let { injectHtmlContext, size } = this.getInjectContent(false, false);
				if (this.size.h && size.h !== this.size.h) {
					this.updateInjectContent();
					return;
				}
				this.msger.send("UPDATE_CONTENT", { injectHtmlContext, size });
			},
		},
		updated() {
			!(this.msger && this.lastInjectSid === this.sid) ? this.updateInjectContent() : this.updateContent();
		},
	});
};

export default MattertagInject;
