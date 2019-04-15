<template>
  <!--地图容器-->

  <div id="app-baiiduditu" class="baidu_map">
    <div id="baidu-map" class="baidu_map" style="height:80%"></div>
    <div style="height:100px">
      <div>{{`上次更新删除了${delLength}条数据`}}</div>
      <div>{{`上次更新添加了${addLength}条数据`}}</div>
      <div>{{`上次更新改变了${changeLength}条数据`}}</div>
      <div>{{`当前有${mapDateNew.length}条数据`}}</div>
    </div>
  </div>

</template>
<script>
export default {
  props: {
    mapDateNew: {
      //新的数据点
      type: [Array],
      default() {
        return [];
      }
    },
    mapDateOld: {
      //旧的数据点
      type: [Array],
      default() {
        return [];
      }
    },
    mapChange: {
      //数据是否发生改变
      type: [Boolean],
      default() {
        return false;
      }
    }
  },
  name: "mapBaidu",
  data() {
    return {
      map: null, //map对象
      zoom: 12, //定义初始的地图等级
      centerlng: 120.15, //定义中心点经度
      centerlat: 30.28, //定义中心点纬度
      markerClusterer: null,
      pointAggregationType: true, //是否开启点聚合
      drawingManager: null,
      delLength: 0,
      addLength: 0,
      changeLength: 0,
      mapOld: [] //旧数据
    };
  },
  methods: {
    // map初始化
    mapInit() {
      // 百度地图API功能
      this.map = new BMap.Map("baidu-map", {
        enableMapClick: true
      }); //创建Map实例
      // 初始化地图,设置中心点坐标和地图级别
      this.map.centerAndZoom(
        new BMap.Point(this.centerlng, this.centerlat),
        this.zoom
      );
      // 开启鼠标滚轮缩放
      this.map.enableScrollWheelZoom(true);
      //地图的平移缩放控件
      this.map.addControl(
        new BMap.NavigationControl({
          offset: new BMap.Size(10, 40)
        })
      );
    },
    //添加点
    addMarker(add) {
      let point = new BMap.Point(add.lng, add.lat);
      var icon = new BMap.Icon("/img/" + add.icon, new BMap.Size(29, 29)); //设置图标大小
      let marker = new BMap.Marker(point);
      marker.id = add.id;
      // marker.icon = add.icon;
      // let opts = {
      //   position: point, // 指定文本标注所在的地理位置
      //   offset: new BMap.Size(-10, 26) //设置文本偏移量
      // };
      // let label = new BMap.Label(add.name, opts); // 创建文本标注对象
      // label.setStyle({
      //   color: "000",
      //   fontSize: "12px",
      //   height: "20px",
      //   lineHeight: "20px",
      //   border: "1px solid #000",
      //   fontFamily: "微软雅黑"
      // });
      this.map.addOverlay(marker); //添加到地图
      // marker.disableMassClear();
      // marker.setLabel(label);
      if (this.pointAggregationType) {
        this.markerClusterer.addMarker(marker);
      }
    },
    //删除点
    delEditMarker(changePonitList, delPointID) {
      let overlaysList;
      if (this.pointAggregationType) {
        //开启点聚合通过markerClusterer类获取点
        overlaysList = this.markerClusterer.getMarkers().slice(0);
      } else {
        //未开启点聚合获取所有覆盖物
        overlaysList = this.map.getOverlays();
      }
      if (changePonitList.length > 0 || delPointID.length > 0) {
        //如果存在需要修改和删除的点
        overlaysList.forEach(item => {
          //删除点
          if (delPointID.indexOf(item.id) > -1) {
            if (this.pointAggregationType) {
              this.markerClusterer.removeMarker(item);
            } else {
              this.map.removeOverlay(item);
            }
          }
          //修改点
          changePonitList.forEach(edit => {
            if (item.id == edit.id) {
              let point = new BMap.Point(edit.lat, edit.lng);
              let icon = new BMap.Icon(edit.icon, new BMap.Size(29, 29));
              item.setIcon(icon); //重新设置图标
              item.setPosition(point); //重新设置经纬度
              if (this.pointAggregationType) {
                this.markerClusterer.setMarkers(item.id, item);
              }
            }
          });
        });
      }
    },
    //比较新旧数组的不同
    filterMap(oldPintList, newPintList) {
      let delPointID = [], //相对于新获取的点需要取消的点的id数组
        otherPointList = [], //相对于新获取的点不需要取消的点
        addPointList = [], //相对于旧的数据点需要添加的点
        newIDList = new Set(), //定义一个数组用来存新数据的id的集合
        oldIDList = new Set(); //定义一个数组用来存旧数据的id的集合
      newPintList.forEach(item => {
        newIDList.add(item.id);
      });
      oldPintList.forEach(item => {
        oldIDList.add(item.id);
      });
      oldPintList.forEach(item =>
        newIDList.has(item.id)
          ? otherPointList.push(item)
          : delPointID.push(item.id)
      );
      newPintList.forEach(item => {
        if (!oldIDList.has(item.id)) {
          addPointList.push(item);
        }
      });
      let changePonitList = this.filterChange(otherPointList, newPintList); //changePonitList:发生变化的点
      return {
        delPointID,
        addPointList,
        changePonitList
      };
    },
    //获取新数据中发生变化的点
    filterChange(otherPointList, newPintList) {
      var changePonitList = []; //变化了的点
      otherPointList.forEach(point => {
        let pList = newPintList.find(item => {
          return item.id == point.id;
        }); //新获取的数据中对应的那个点
        if (
          pList.lng != point.lng ||
          pList.lat != point.lat ||
          pList.icon != point.icon
        ) {
          changePonitList.push(pList);
        }
      });
      return changePonitList;
    }
  },
  mounted() {
    window.onload = this.mapInit();
    //初始化地图
  },
  watch: {
    mapChange: {
      handler() {
        if (this.map == null) {
          //地图还未初始化
          return;
        }
        this.map.disableDragging(); //禁止拖拽
        let { delPointID, addPointList, changePonitList } = this.filterMap(
          this.mapDateOld,
          this.mapDateNew
        ); //获取删除点、新增点、修改点
        this.delLength = delPointID.length;
        this.addLength = addPointList.length;
        this.changeLength = changePonitList.length;
        if (this.markerClusterer == null && this.pointAggregationType) {
          //如果点击后对象为null，且开启点聚合，则重新创建点聚合
          this.markerClusterer = new BMapLib.MarkerClusterer(this.map, {
            markers: []
          });
        }
        this.delEditMarker(changePonitList, delPointID); //修改删除点
        addPointList.forEach(add => {
          //添加点
          this.addMarker(add);
        });
        this.map.enableDragging(); //开启拖拽
      }
    }
  }
};
</script>

<style lang="scss" scoped>
html,
body,
.baidu_map {
  width: 100%;
  height: 100%;
  overflow: hidden;
  margin: 0;
  font-family: "微软雅黑";
}

.sliders {
  display: none;
  position: absolute;
  width: 300px;
  padding: 0 10px;
  background: rgba(240, 255, 255, 0.8);

  .tipName {
    margin: 0;
  }
}

.speeds {
  display: none;
  position: absolute;
  width: 100px;
  padding: 0 10px;
  background: rgba(240, 255, 255, 0.8);

  .tipName {
    margin: 0;
  }
}

.doingbox {
  position: absolute;
  left: 251px;
  top: 77px;
  height: 34px;
  width: 500px;
  overflow: hidden;
  border-bottom: 1px solid #c4c4c4;
  z-index: 5;
  background: #d9e9f9;
  border-right: 1px solid #c4c4c4;
  border-bottom-right-radius: 6px;
}

.doingbox li {
  float: left;
  height: 34px;
  width: 70px;
  line-height: 34px;
  font-size: 12px;
  cursor: pointer;
  opacity: 0.6;
  list-style: none;
}

.doingbox li:hover {
  opacity: 1;
}

.doingbox li img {
  margin-left: 10px;
  float: left;
  margin-top: 7px;
  margin-right: 5px;
}
</style>