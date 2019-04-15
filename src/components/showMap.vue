<template>
  <div :style="{width:'100%',height:'600px'}">
    <mapBaidu :mapChange="isChange" :mapDateOld="mapDataTableOld" :mapDateNew="mapDataTable"></mapBaidu>
  </div>
</template>

<script>
import mapBaidu from "./mapBaidu.vue";
export default {
  name: "showMap",
  components: {
    mapBaidu
  },
  data() {
    return {
      isChange: false, //数据是否改变
      mapDataTable: [], //新获取的点数据
      mapDataTableOld: [], //上一次获取的点数据
      timer: null //定时器
    };
  },
  methods: {
    //深拷贝数组
    deepCopy(obj) {
      var result = Array.isArray(obj) ? [] : {};
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === "object") {
            result[key] = this.deepCopy(obj[key]); //递归复制
          } else {
            result[key] = obj[key];
          }
        }
      }
      return result;
    },
    //通过定时器模拟数据更新
    getMapData() {
      if (this.timer == null) {
        this.timer = setInterval(() => {
          this.mapDataTableOld = this.deepCopy(this.mapDataTable);
          let addNum = Math.random() * 10, //随机添加点的数量
            delNum = Math.random() * 10, //随机删除点的数量
            editNum = Math.random() * 10, //随机修改点的数量
            addList = [], //添加的数组
            delList = [], //删除的数组
            editList = [], //修改的数组
            maxid = this.mapDataTableOld[this.mapDataTableOld.length - 1].id,
            minid = this.mapDataTableOld[0].id;
          for (let index = 0; index < addNum; index++) {
            this.mapDataTable.push({
              id: maxid + index,
              lng: 120 + Math.random(),
              name: `点${index}`,
              lat: 30 + Math.random(),
              icon: Math.random() > 0.5 ? "car-normal.png" : "car-speeding.png"
            });
          }
          for (let index = 0; index < delNum; index++) {
            this.mapDataTable.shift();
          }
          for (let index = 0; index < editNum; index++) {
            let editID = parseInt(
              Math.random() * (maxid - minid + 1) + minid,
              10
            );
            let editPoint = this.mapDataTable.find(item => item.id == editID);
            if (editPoint != undefined) {
              editPoint.lng = 120 + Math.random();
              editPoint.lat = 30 + Math.random();
              editPoint.icon =
                Math.random() > 0.5 ? "car-normal.png" : "car-speeding.png";
            }
          }
          this.isChange = !this.isChange;
        }, 10000);
      }
    },
    //随机生成数据
    getRandom() {
      let randomData = [];
      for (let index = 0; index < 1500; index++) {
        randomData.push({
          id: index,
          lng: 120 + Math.random(),
          name: `点${index}`,
          lat: 30 + Math.random(),
          icon: Math.random() > 0.5 ? "car-normal.png" : "car-speeding.png"
        });
      }
      this.mapDataTable = randomData;
    }
  },
  beforeRouteLeave(to, from, next) {
    if (this.timer != null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    next();
  },
  mounted() {
    this.getRandom();
    this.isChange = !this.isChange;
    this.getMapData();
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
