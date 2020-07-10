<template>
	<div id="app">
		<!-- 嵌入文档 -->
		<iframe src="http://192.168.1.142:1003/" frameborder="0" ref="iframeRef"></iframe>
		<!-- 嵌入文档 end -->

		<!-- 可移动对话框 -->
		<div id="removableDialog" ref="removableDialogRef">
			<!-- 顶部 -->
			<div class="removableDialogHd" ref="removableDialogHdRef" @mousedown="removeStart($event)" @mouseup="removeEnd"></div>

			<!-- 主体 -->
			<div class="removableDialogBd" ref="removableDialogBdRef">
				<span>第{{ examQuestionID }}题</span>
				<button class="btn" @click="lastQuestion" v-show="examQuestionID != 1">上一题</button>
				<button class="btn" @click="nextQuestion" v-show="examQuestionID != examQuestions.length">下一题</button>
				<button class="btn" @click="completedQuestion">标记完成</button>
			</div>
		</div>
		<!-- 可移动对话框 end -->
	</div>
</template>

<script>
export default {
	name: 'App',
	data() {
		return {
			// ------------------------ 可移动对话框 ------------------------
			isRemove: false, //是否移动
			reDlgX: '',
			reDlgY: '',

			// ------------------------ 答题 ------------------------
			examQuestions: [
				{
					id: 1,
					title: '第一题'
				},
				{
					id: 2,
					title: '第二题'
				},
				{
					id: 3,
					title: '第三题'
				}
			], //试题
			answerRecords: {}, // 答题记录
			examQuestionID: 1, // 当前题目id
			isCompleted: false
		};
	},
	methods: {
		// ------------------------ 可移动对话框 ------------------------
		// 鼠标移动事件
		mouseMoveEvent() {
			let reDlgHdHeight = this.$refs.removableDialogHdRef.offsetHeight;
			let reDlgBdWidth = this.$refs.removableDialogBdRef.offsetWidth;
			let reDlgBdHeight = this.$refs.removableDialogBdRef.offsetHeight;

			// 鼠标移动事件侦听器
			document.addEventListener('mousemove', e => {
				if (this.isRemove) {
					let cx = e.clientX - this.reDlgX;
					let cy = e.clientY - this.reDlgY;
					if (cx < 0) {
						cx = 0;
					}
					if (cy < 0) {
						cy = 0;
					}
					if (window.innerWidth - e.clientX + this.reDlgX < reDlgBdWidth) {
						cx = window.innerWidth - reDlgBdWidth;
					}
					if (e.clientY > window.innerHeight - reDlgBdHeight - reDlgHdHeight + this.reDlgY) {
						cy = window.innerHeight - reDlgHdHeight - reDlgBdHeight;
					}
					// 鼠标移动到 浏览器外 移动结束
					if (e.clientX < 0 || e.clientX > window.innerWidth || e.clientY < 0) {
						this.removeEnd();
					}
					// 鼠标移动到 可移动盒子内容部分 移动结束
					if (e.clientY > window.innerHeight - reDlgBdHeight) {
						this.removeEnd();
					}

					this.$refs.removableDialogRef.style.right = window.innerWidth - reDlgBdWidth - cx + 'px';
					this.$refs.removableDialogRef.style.bottom = window.innerHeight - reDlgHdHeight - reDlgBdHeight - cy + 'px';
				}
			});
			document.addEventListener('mouseup', e => {
				if (e.clientX < 0 || e.clientX > window.innerWidth || e.clientY < 0 || e.clientY > window.innerHeight) {
					this.removeEnd();
				}
			});
		},
		// 移动开始
		removeStart(e) {
			this.isRemove = true;
			this.reDlgX = e.offsetX;
			this.reDlgY = e.offsetY;
			this.$refs.removableDialogRef.style.opacity = 0.9;
		},
		// 移动结束
		removeEnd() {
			this.isRemove = false;
			this.$refs.removableDialogRef.style.opacity = 1;
		},

		// ------------------------ 消息 ------------------------
		// 发送消息
		sendMessage(cmd, params) {
			this.$refs.iframeRef.contentWindow.postMessage({ cmd, params }, '*');
		},
		// 处理消息
		handleMessage(msg) {
			let { data } = msg;

			if (data.cmd) {
				if (data.cmd == 'answer') {
					this.answerRecords[this.examQuestionID] = data.params.answer;

					console.log('答案：', this.answerRecords);
				}
			}
		},

		// ------------------------ 答题 ------------------------
		// 上一题按钮
		lastQuestion() {
			if (this.examQuestionID > 1) {
				this.examQuestionID = this.examQuestionID - 1;
			}
		},
		// 下一题按钮
		nextQuestion() {
			if (this.examQuestionID < this.examQuestions.length) {
				this.examQuestionID = this.examQuestionID + 1;
			}
		},
		// 题目完成按钮
		completedQuestion() {
			this.isCompleted = !this.isCompleted;
			this.sendMessage('completed', { isCompleted: this.isCompleted });
		}
	},
	mounted() {
		this.$nextTick(() => {
			// 鼠标移动事件
			this.mouseMoveEvent();
			// 创建处理消息侦听器
			window.addEventListener('message', this.handleMessage);
		});
	},
	destroyed() {
		// 销毁处理消息侦听器
		window.removeEventListener('message', this.handleMessage);
	}
};
</script>
