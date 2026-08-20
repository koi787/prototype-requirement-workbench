export interface RolePermissionNode {
  id: string;
  label: string;
  children?: readonly RolePermissionNode[];
}

export const ROLE_PERMISSION_TREE: readonly RolePermissionNode[] = [
  { id: "permission-49dd5792141f", label: "小程序", children: [
    { id: "permission-14856b87857a", label: "今日数据" },
    { id: "permission-abfdc2d3f2c6", label: "扫一扫" },
    { id: "permission-641c1dd7e485", label: "开门码" },
    { id: "permission-ba62cc7ae31d", label: "待上课程" },
    { id: "permission-50633c44d93a", label: "课时统计" },
    { id: "permission-aa0fa908a247", label: "上课记录" },
    { id: "permission-aec34b8e78ec", label: "门店排课" },
    { id: "permission-030174887dc6", label: "美容师资料" },
    { id: "permission-abfab993e301", label: "服务门店" },
    { id: "permission-9703daa03c38", label: "美容师档期" },
    { id: "permission-a5e8b876fd9e", label: "教练资料" },
    { id: "permission-b1fabecc2618", label: "上课门店" },
    { id: "permission-0e0eaa81803d", label: "档期管理" },
    { id: "permission-1e5408956e48", label: "券包赠送" },
    { id: "permission-103572563be7", label: "服务费" },
    { id: "permission-bfe7cb5acd3d", label: "专属码" },
    { id: "permission-35dcb8f177f5", label: "一键休息" },
    { id: "permission-8e31e1fc373b", label: "我的证书" },
    { id: "permission-c798ec3c45cb", label: "分享有礼" }
  ] },
  { id: "permission-d00981d6ce08", label: "排行榜", children: [
    { id: "permission-00d09d7d4ff2", label: "金额，课时是否可见" },
    { id: "permission-0ee4f3321db0", label: "远程开门" },
    { id: "permission-c7411095327f", label: "五维问卷" },
    { id: "permission-f6bd02b51545", label: "小奥同学" },
    { id: "permission-fc8a55c2d450", label: "线下体验核销" },
    { id: "permission-4f7f10916ca5", label: "门禁设置" },
    { id: "permission-7c60ca78461c", label: "系统操作手册" }
  ] },
  { id: "permission-ff93ad0e4ec6", label: "首页", children: [
    { id: "permission-52f844d705dd", label: "趋势图" },
    { id: "permission-b06bf0d42353", label: "五维问卷-下载二维码" }
  ] },
  { id: "permission-31376ec5020f", label: "预约", children: [
    { id: "permission-7ba5e6ef5bcd", label: "团课", children: [
      { id: "permission-fd92612d6091", label: "复制课表" },
      { id: "permission-4640fb178c16", label: "下载课表" },
      { id: "permission-18be8f8debc1", label: "团课课表-新增" },
      { id: "permission-ca0179c0d8f8", label: "一键开启" },
      { id: "permission-4933970f28d1", label: "团课-用户代约课" }
    ] },
    { id: "permission-2f5e4e66eb37", label: "私教", children: [
      { id: "permission-f032ecd516eb", label: "私教-用户代约课" }
    ] },
    { id: "permission-f91f461a8f28", label: "美容预约" }
  ] },
  { id: "permission-24e04f5f122b", label: "品项", children: [
    { id: "permission-4999a2260e56", label: "商品类目", children: [
      { id: "permission-738ed8d43c91", label: "品项类型-编辑" },
      { id: "permission-bd53fc1f751b", label: "品项类型-新增" },
      { id: "permission-407c7749c1ee", label: "品项类型-删除" }
    ] },
    { id: "permission-b000418ec06c", label: "权益设置", children: [
      { id: "permission-94ee5de570b6", label: "瑜伽品项", children: [
        { id: "permission-539d7d725fbf", label: "品项课卡-新增" },
        { id: "permission-09892939170d", label: "品项课卡-编辑" },
        { id: "permission-8a3ef12cd364", label: "品项管理-删除" }
      ] },
      { id: "permission-b1fd2ee6bd76", label: "美容品项", children: [
        { id: "permission-06c18b4a3aab", label: "美容品项-新增" },
        { id: "permission-116f9da22fb6", label: "美容品项-编辑" },
        { id: "permission-8fb919b2be16", label: "美容品项-删除" }
      ] },
      { id: "permission-c511af157914", label: "产品管理", children: [
        { id: "permission-d7857a22dc88", label: "售卖设置" }
      ] },
      { id: "permission-f8b025449868", label: "组合权益", children: [
        { id: "permission-9140c5314826", label: "组合权益-新增" },
        { id: "permission-a1b4f7601e64", label: "组合权益-编辑" },
        { id: "permission-35eacc3db10c", label: "组合权益-删除" }
      ] }
    ] }
  ] },
  { id: "permission-22eaf91bd600", label: "教培班", children: [
    { id: "permission-83af3bc43872", label: "教培班-编辑" },
    { id: "permission-f84d8558b5fd", label: "教培班-删除" },
    { id: "permission-74931923052f", label: "教培班-购买记录" },
    { id: "permission-257a184f27c2", label: "教培班-录单" },
    { id: "permission-070d3de81718", label: "教培班-转班" },
    { id: "permission-ec85e70a1743", label: "教培班-上课导师" },
    { id: "permission-4c6f9c95fc87", label: "教培班-下单" }
  ] },
  { id: "permission-3ce3623da1be", label: "集训营", children: [
    { id: "permission-777e45f10d32", label: "集训营-新增" },
    { id: "permission-9410eb6abb8c", label: "集训营-编辑" },
    { id: "permission-f226978a4f7e", label: "集训营-删除" },
    { id: "permission-f229710c4d46", label: "购买记录" },
    { id: "permission-d930b3ce0e67", label: "下单" }
  ] },
  { id: "permission-739bf103896a", label: "基础资料", children: [
    { id: "permission-f83d09f8eec1", label: "瑜伽类型", children: [
      { id: "permission-7cc37c94b40c", label: "瑜伽类型-新增" },
      { id: "permission-b7ecf1821206", label: "瑜伽类型-编辑" },
      { id: "permission-403d1cb79bfa", label: "瑜伽类型-删除" }
    ] },
    { id: "permission-a749e464edc4", label: "美容类型", children: [
      { id: "permission-e4e814d81982", label: "美容类型-编辑" },
      { id: "permission-a916ef71d38d", label: "美容类型-售卖设置" },
      { id: "permission-98f2e76e5c1a", label: "美容类型-配料清单" },
      { id: "permission-e82cecde455e", label: "美容类型-新增" }
    ] },
    { id: "permission-f67a05015391", label: "产品信息", children: [
      { id: "permission-4693d7b902b1", label: "产品-业务设置" }
    ] },
    { id: "permission-d60174692115", label: "场地费" },
    { id: "permission-c1c9525b05f9", label: "债权课时费" }
  ] },
  { id: "permission-6a154fc59e43", label: "库存管理", children: [
    { id: "permission-35a1e46fdd85", label: "门店库存" },
    { id: "permission-d200f4c74186", label: "直接调拨单", children: [
      { id: "permission-df10f7fdc9be", label: "普通调拨单金额" },
      { id: "permission-80a8b258d7ae", label: "退货调拨单金额" }
    ] },
    { id: "permission-b8193cec7f06", label: "盘点库存" },
    { id: "permission-fdd73500c4b4", label: "盘点单" },
    { id: "permission-47e77e47d713", label: "其他出入库单" }
  ] },
  { id: "permission-454d750162e9", label: "收银", children: [
    { id: "permission-4d4fda954729", label: "收银" },
    { id: "permission-c5cc94f9c487", label: "配料" }
  ] },
  { id: "permission-4e80217785f2", label: "门店人员", children: [
    { id: "permission-b9b2cbf9fca3", label: "人才招募" },
    { id: "permission-0a376b0cf950", label: "瑜伽教练", children: [
      { id: "permission-f76d9f29fb4f", label: "教练列表", children: [
        { id: "permission-41aa4a540c78", label: "教练列表-查看详情" },
        { id: "permission-bfd6906769ff", label: "教练列表-私教会员明细" },
        { id: "permission-e406cc6ada21", label: "编辑课程" },
        { id: "permission-969d0f5b1b22", label: "教练列表-赠送存量分" }
      ] },
      { id: "permission-0121cfd7a401", label: "资料审核", children: [
        { id: "permission-747491208e89", label: "教练修改记录-查看详情" }
      ] },
      { id: "permission-0d89f9f526c0", label: "教练标签配置" },
      { id: "permission-c3a549fa664a", label: "证书审核", children: [
        { id: "permission-25cd9693e4a4", label: "教练证书记录-通过" },
        { id: "permission-6771d3669d28", label: "教练证书记录-拒绝" }
      ] },
      { id: "permission-c4b298bfcd77", label: "上课记录", children: [
        { id: "permission-411fa2cc1a3d", label: "教练上课记录-查看详情" },
        { id: "permission-7da95b50c270", label: "教练上课记录-导出" },
        { id: "permission-849a50142ffa", label: "教练上课记录-取消约课" }
      ] },
      { id: "permission-9fe2a003efe7", label: "教培上课导师" }
    ] },
    { id: "permission-e309e622874b", label: "美容师", children: [
      { id: "permission-531324c2f9b4", label: "美容师列表" },
      { id: "permission-11008c3fa824", label: "美容师资料审核" },
      { id: "permission-cdd0fd2b5ec4", label: "美容服务记录" }
    ] }
  ] },
  { id: "permission-81b3798bebc6", label: "订单", children: [
    { id: "permission-12ce4270426f", label: "合同中心", children: [
      { id: "permission-3e808a4328bf", label: "课卡合同-导出" },
      { id: "permission-a82b5ea1287f", label: "课卡合同-修改课时" },
      { id: "permission-dbc5f21e8a02", label: "课卡合同-查看详情" },
      { id: "permission-b30e78e93010", label: "课卡合同-补单" },
      { id: "permission-2f2f9ac9b223", label: "课卡合同-结转" },
      { id: "permission-088156cab5f3", label: "课卡合同-退款" },
      { id: "permission-7215f2d44d41", label: "课卡合同-转让" },
      { id: "permission-aeb9c9814a34", label: "课卡合同-延期" },
      { id: "permission-86fd99059ed4", label: "课卡合同-停卡" },
      { id: "permission-2a3abc67c05a", label: "课卡合同-售后" },
      { id: "permission-cbbd45b93d76", label: "课卡合同-红冲" },
      { id: "permission-5bee2e710daa", label: "课卡合同-券包导入" },
      { id: "permission-c25b96ca656d", label: "课卡合同-课卡导入" }
    ] },
    { id: "permission-3e827b5e66a7", label: "订单中心", children: [
      { id: "permission-42589949ee63", label: "订单中心-导出" },
      { id: "permission-9ecf2c178d6d", label: "订单中心-取消订单" },
      { id: "permission-ad159c2f94e5", label: "订单中心-作废" },
      { id: "permission-d71d7b993164", label: "订单中心-修改购买门店" }
    ] }
  ] },
  { id: "permission-9058a1c2c59e", label: "记录", children: [
    { id: "permission-295403bdaad2", label: "券包赠送记录" },
    { id: "permission-896cd1d79d01", label: "券包使用记录", children: [
      { id: "permission-63729bd55cac", label: "券包使用记录-导出" }
    ] },
    { id: "permission-a203c22f7d8a", label: "反馈管理", children: [
      { id: "permission-015bc0f4593b", label: "问题反馈记录", children: [
        { id: "permission-ce9ff3330a81", label: "问题反馈记录-处理" }
      ] }
    ] },
    { id: "permission-28e96849360d", label: "反馈模块", children: [
      { id: "permission-4f2b001526e5", label: "反馈模块-编辑" },
      { id: "permission-fb2350cc8968", label: "反馈模块-删除" }
    ] },
    { id: "permission-135ad5b9171b", label: "冻结记录", children: [
      { id: "permission-446bde6dd243", label: "冻结记录-导出" },
      { id: "permission-3a2f0b603bbf", label: "冻结记录-开卡" }
    ] },
    { id: "permission-469e7150cd1c", label: "转卡记录" },
    { id: "permission-d9b8a957dad4", label: "延期记录" },
    { id: "permission-23e17cc158fa", label: "签到记录" }
  ] },
  { id: "permission-52d6e9087708", label: "门店", children: [
    { id: "permission-5e4f66c866cf", label: "数据大屏" },
    { id: "permission-b873b9ca18f3", label: "门店列表", children: [
      { id: "permission-91542ab6cff8", label: "门店新增" },
      { id: "permission-ef5b9034fc64", label: "推荐位管理" },
      { id: "permission-39ebb821a18f", label: "门店列表-编辑" }
    ] },
    { id: "permission-7a6ff291bd0b", label: "用户端配置", children: [
      { id: "permission-e4358edbad77", label: "视频配置" }
    ] },
    { id: "permission-2747ad13a225", label: "门店房间", children: [
      { id: "permission-d65bdda8ae0a", label: "门店房间-新增" },
      { id: "permission-d12de7e230d3", label: "门店房间-编辑" },
      { id: "permission-f1c197c40ed7", label: "门店房间-删除" },
      { id: "permission-ce535c8bd92f", label: "门店房间-日程" }
    ] },
    { id: "permission-f5a59dd3b47d", label: "数据看板" },
    { id: "permission-1b45f4decbcc", label: "数据概览" },
    { id: "permission-a259703da3fb", label: "门店轮播图", children: [
      { id: "permission-47518e88e14c", label: "门店轮播图-新增" },
      { id: "permission-e40cfc40ec86", label: "门店轮播图-编辑" },
      { id: "permission-a3e90036bfa4", label: "门店轮播图-删除" }
    ] },
    { id: "permission-53c81bd85dab", label: "通店区域", children: [
      { id: "permission-c465908d4dcf", label: "通店区域-编辑" },
      { id: "permission-3ca42a55dbdc", label: "通店区域-删除" }
    ] },
    { id: "permission-ca51fe360c21", label: "店铺装修" },
    { id: "permission-a8a41c8b602b", label: "认购申请" },
    { id: "permission-612ffeaa4020", label: "店铺入驻申请" }
  ] },
  { id: "permission-f20687060126", label: "客户", children: [
    { id: "permission-ef6853e7c2ce", label: "客户列表", children: [
      { id: "permission-9f0985112cfb", label: "用户列表-查看详情" },
      { id: "permission-3d699a8b1a31", label: "美团抖音核销" },
      { id: "permission-90fec5d85453", label: "用户合并" },
      { id: "permission-da8fbd8e52f9", label: "优惠券失效" },
      { id: "permission-22050fe1025d", label: "储值金充值" },
      { id: "permission-e0b65772b20b", label: "删除用户-慎用（权限别给）" },
      { id: "permission-99f1df22422e", label: "用户资料修改" },
      { id: "permission-b293fcea48d0", label: "新增积分" },
      { id: "permission-e3b0920b75c1", label: "创建用户" },
      { id: "permission-b48902e35080", label: "解绑第三方平台" },
      { id: "permission-603972fd4f57", label: "地推问券-查看" },
      { id: "permission-306e91869e8c", label: "券包录单" },
      { id: "permission-a123802b1d71", label: "课包录单" },
      { id: "permission-93790fd805dc", label: "课卡录单" },
      { id: "permission-53e386cb7a18", label: "换套餐" },
      { id: "permission-39c770c5b9b6", label: "退回" },
      { id: "permission-deb064d6b662", label: "同步" }
    ] },
    { id: "permission-a9cbf977948c", label: "客户统计" },
    { id: "permission-05d33c5385d3", label: "约课记录", children: [
      { id: "permission-2cb3f9914c77", label: "用户上课记录-查看详情" },
      { id: "permission-3720410481f9", label: "约课记录-导出" },
      { id: "permission-f409c18797ae", label: "上课记录-取消约课" },
      { id: "permission-27aab47b3ba0", label: "用户-补签" }
    ] },
    { id: "permission-58e9c37e3255", label: "合并记录" },
    { id: "permission-e5f0d969868d", label: "美容预约记录" },
    { id: "permission-3356f0cd9cfe", label: "客户运营", children: [
      { id: "permission-bbfc42211015", label: "会员等级", children: [
        { id: "permission-f13455693668", label: "会员等级-新增" },
        { id: "permission-6d63d32c6f30", label: "会员等级-编辑" },
        { id: "permission-fe7b1bbc391c", label: "会员等级-删除" }
      ] }
    ] },
    { id: "permission-a0c0e2c37101", label: "储值管理", children: [
      { id: "permission-92e661abeb6b", label: "储值设置", children: [
        { id: "permission-0ddfc339bb5a", label: "金额设置-新增" },
        { id: "permission-393a411f0a9d", label: "金额设置-编辑" },
        { id: "permission-0651eedb942e", label: "金额设置-删除" }
      ] },
      { id: "permission-6924d8aa9c7a", label: "储值合同", children: [
        { id: "permission-0ad5a08f0a4c", label: "储值合同-录入" },
        { id: "permission-97cc3e26080e", label: "储值合同-导出" },
        { id: "permission-c728de225b3c", label: "储值合同-退款" }
      ] },
      { id: "permission-b54b6f857c07", label: "储值流水", children: [
        { id: "permission-723dde75ced7", label: "储值流水-导出" }
      ] }
    ] },
    { id: "permission-500c80d51006", label: "客户消息记录" },
    { id: "permission-0d140b8c8051", label: "用户趋势" }
  ] },
  { id: "permission-c659efed433f", label: "潜客管理", children: [
    { id: "permission-fe092b5895aa", label: "门店客户", children: [
      { id: "permission-8f1ba043dae7", label: "导出记录" },
      { id: "permission-d1ac7f0f0317", label: "分配" },
      { id: "permission-772f1c09bba6", label: "转让" },
      { id: "permission-3fc77a82b5a2", label: "设置标签" },
      { id: "permission-1aa1d1465490", label: "跟进记录" },
      { id: "permission-da8c21930b92", label: "客资来源变更登记" },
      { id: "permission-1c3ef9ddd1df", label: "跟进详情" },
      { id: "permission-c2228fb4db2f", label: "备注" },
      { id: "permission-1232464b6fec", label: "添加到店记录" },
      { id: "permission-c40e60114115", label: "添加拜访记录" },
      { id: "permission-db4acd23e564", label: "标注无效客资" },
      { id: "permission-96aa3747ee2e", label: "拨打电话" },
      { id: "permission-03e2b96fb862", label: "已丢单" },
      { id: "permission-5814c3b15f07", label: "添加共享人" }
    ] },
    { id: "permission-4748a8d38cb0", label: "员工座席", children: [
      { id: "permission-6f1e38cf099f", label: "员工座席-新增" },
      { id: "permission-ae707e44f1d5", label: "员工座席-编辑" },
      { id: "permission-79743c880c93", label: "员工座席-删除" }
    ] },
    { id: "permission-ab91d2c1a67c", label: "客户公海", children: [
      { id: "permission-ab4fbf6d75df", label: "公海-分配" },
      { id: "permission-778adce9371c", label: "公海-转让" },
      { id: "permission-606e7feb60eb", label: "公海-设置标签" },
      { id: "permission-db70c65da2dc", label: "公海用户有效期" },
      { id: "permission-0ab2c7be0681", label: "公海-导出" },
      { id: "permission-6dd1e7f22454", label: "公海-通话记录" },
      { id: "permission-cf85652ba2cb", label: "公海-拨打电话" },
      { id: "permission-f4493b23d9b7", label: "公海-添加用户" },
      { id: "permission-f50165e96528", label: "公海-编辑用户" },
      { id: "permission-c1a76f8d720d", label: "公海-导出平台分析" },
      { id: "permission-c5719fb45eaa", label: "公海-变更为无效" },
      { id: "permission-5a6fde1d0a30", label: "公海-添加到店记录" },
      { id: "permission-bfedc4712e6a", label: "公海-标注无效客户" },
      { id: "permission-45e7e41b563c", label: "公海-跟进详情" }
    ] },
    { id: "permission-e7dea030fa33", label: "无效公海", children: [
      { id: "permission-8e1e19e441b1", label: "无效公海-导出" },
      { id: "permission-15b074808c0e", label: "无效公海-编辑" },
      { id: "permission-f9407a15c87d", label: "无效公海-设置标签" },
      { id: "permission-5eca58bb7bdd", label: "无效公海-跟进记录" },
      { id: "permission-7b72fff5bd59", label: "无效公海-变更为有效" },
      { id: "permission-a39c9f66fa05", label: "无效公海-备注" },
      { id: "permission-078a780d11db", label: "无效公海-跟进详情" }
    ] },
    { id: "permission-2d4770553bdb", label: "我负责的", children: [
      { id: "permission-44c08c96bc85", label: "我负责的-跟进" },
      { id: "permission-6bf16e5c4254", label: "公海-导入" },
      { id: "permission-2af26051873f", label: "跟进详情" },
      { id: "permission-d07e7b00e8b4", label: "备注" },
      { id: "permission-8ba8c233a3fa", label: "设置标签" },
      { id: "permission-27894533f392", label: "添加到店记录" },
      { id: "permission-6a66c5341fb4", label: "添加拜访记录" },
      { id: "permission-404236d036b0", label: "标注无效客资" },
      { id: "permission-db7cfb8e378e", label: "拨打电话" },
      { id: "permission-669f47d33a02", label: "我负责的-导出" }
    ] },
    { id: "permission-2ed30bdf924e", label: "到店记录", children: [
      { id: "permission-61c465351489", label: "到店记录-导出" }
    ] },
    { id: "permission-76b403696a9f", label: "通话记录", children: [
      { id: "permission-debc86c1a51d", label: "通话记录-导出" }
    ] },
    { id: "permission-1b2fe154ede5", label: "标签分组" },
    { id: "permission-cf2d31a9fd07", label: "拜访记录", children: [
      { id: "permission-b470cb265937", label: "拜访记录-导出" }
    ] }
  ] },
  { id: "permission-9834f85de584", label: "员工", children: [
    { id: "permission-d5410814e31b", label: "角色列表", children: [
      { id: "permission-27ddd6f0d7de", label: "角色列表-新增" },
      { id: "permission-aad8870a2c92", label: "角色列表-编辑" },
      { id: "permission-9b5795c83f0b", label: "角色列表-删除" }
    ] },
    { id: "permission-ce02290e8f40", label: "组织架构", children: [
      { id: "permission-4514cde5309c", label: "组织架构-编辑" },
      { id: "permission-e5929a14cc17", label: "是否教练" },
      { id: "permission-1d561990888c", label: "组织架构-注销登录" },
      { id: "permission-136a627a94db", label: "组织架构-消息测试" },
      { id: "permission-fdda543dbcff", label: "组织架构-新增员工" }
    ] },
    { id: "permission-751045f7831a", label: "员工消息记录" },
    { id: "permission-331c9270a3f3", label: "存量分" },
    { id: "permission-16b6fc7c5dbf", label: "对账单" },
    { id: "permission-72997b312c06", label: "确认对账单", children: [
      { id: "permission-e0a1e10965f3", label: "对账单-导入" },
      { id: "permission-e2204b84f888", label: "对账单-导出" }
    ] }
  ] },
  { id: "permission-79c214f12c0f", label: "联营", children: [
    { id: "permission-e3d996c34e58", label: "联营店汇总" },
    { id: "permission-7b1f7b230544", label: "联营对账单", children: [
      { id: "permission-c879e3685a6a", label: "联营对账单-导入" },
      { id: "permission-0afb207634c8", label: "联营对账单-导出" }
    ] },
    { id: "permission-b1fa79d637fc", label: "天九联营汇总", children: [
      { id: "permission-c2bed1e33743", label: "天九联营汇总-导入" },
      { id: "permission-7a8dfd35391d", label: "天九联营汇总-导出" }
    ] }
  ] },
  { id: "permission-46139034609a", label: "财务", children: [
    { id: "permission-8b91fda67300", label: "业务报表", children: [
      { id: "permission-83234af9fb9f", label: "订单课程报表" },
      { id: "permission-613b8d96c940", label: "消耗课程报表" },
      { id: "permission-ca5ce5d51b55", label: "剩余权益报表" },
      { id: "permission-13a074049e2b", label: "门店业绩汇总" }
    ] },
    { id: "permission-661bbdb705fe", label: "课时报表", children: [
      { id: "permission-70f4af6735c1", label: "教练课时统计", children: [
        { id: "permission-4be186ead1e4", label: "教练课时统计-导出" }
      ] },
      { id: "permission-2f8a387bab9a", label: "用户课卡统计", children: [
        { id: "permission-b4b1a4634a01", label: "用户课卡统计-导出" }
      ] },
      { id: "permission-0559a0da3835", label: "教室使用统计" },
      { id: "permission-e69f4f8c63cc", label: "用户课程消耗汇总" },
      { id: "permission-456988cfd5ce", label: "教练课程消耗汇总" },
      { id: "permission-45aa7c11f91f", label: "用户门店上课统计", children: [
        { id: "permission-f2240d6323d5", label: "用户门店上课统计-导出" }
      ] },
      { id: "permission-2ea4e521a64e", label: "门店消耗课时统计" },
      { id: "permission-37b0fb7cc924", label: "上课人数分组统计" }
    ] },
    { id: "permission-06e6cacfe5e7", label: "收款管理", children: [
      { id: "permission-e053d4451402", label: "收款流水", children: [
        { id: "permission-bc5c46f3652e", label: "收款流水-导出" },
        { id: "permission-0c0646c32643", label: "收款流水-拆分" }
      ] },
      { id: "permission-5bd4273d458a", label: "收款汇总", children: [
        { id: "permission-a3c098e835a7", label: "收款汇总-导出" }
      ] },
      { id: "permission-e7f3ea0a0855", label: "收款渠道配置", children: [
        { id: "permission-657e94008937", label: "收款渠道配置-新增" },
        { id: "permission-78d1769ac8f8", label: "收款渠道配置-编辑" },
        { id: "permission-bca2d51ce582", label: "收款渠道配置-删除" }
      ] },
      { id: "permission-be603d8d33d2", label: "企微收款记录" }
    ] },
    { id: "permission-bb62a15002a4", label: "订单报表", children: [
      { id: "permission-0cbfd84bcfa6", label: "订单卡项汇总", children: [
        { id: "permission-19d6efcc38cc", label: "订单卡项汇总-导出" }
      ] },
      { id: "permission-e681df489760", label: "订单课程汇总", children: [
        { id: "permission-56f05670170e", label: "订单课程汇总-导出" }
      ] }
    ] },
    { id: "permission-1352e14ea36b", label: "退款管理", children: [
      { id: "permission-b62a81925189", label: "退款记录", children: [
        { id: "permission-37ff3234e6c9", label: "退款记录-确认退款" },
        { id: "permission-bb412528384c", label: "退款记录-导出" }
      ] }
    ] },
    { id: "permission-a55edd069eab", label: "结转金记录", children: [
      { id: "permission-856b6cd3e67f", label: "结转金-修改" },
      { id: "permission-6fabe57c46c2", label: "结转金记录-导出" }
    ] },
    { id: "permission-590c553cde35", label: "客户剩余权益", children: [
      { id: "permission-1d06e900b63b", label: "课卡快照-导出" }
    ] },
    { id: "permission-0ea5a5a5aa63", label: "权益变动记录" },
    { id: "permission-4f28906c7173", label: "消耗记录", children: [
      { id: "permission-9d3fcd7a3d17", label: "品项消耗", children: [
        { id: "permission-303a36b02d00", label: "课卡消耗-录入" },
        { id: "permission-62ddce277036", label: "课卡消耗-导出" },
        { id: "permission-11cfe7bfc406", label: "课卡消耗-用户上课详情" }
      ] },
      { id: "permission-bc29845ccab6", label: "配料记录" },
      { id: "permission-d52cf93c7552", label: "产品消耗", children: [
        { id: "permission-0651e664cf0a", label: "产品消耗-导出" }
      ] }
    ] },
    { id: "permission-04d2aee4b857", label: "消耗报表", children: [
      { id: "permission-e2c3e920af3f", label: "门店消耗报表", children: [
        { id: "permission-548009e99520", label: "门店消耗报表-导出" }
      ] },
      { id: "permission-b932742fe65c", label: "课卡消耗记录" }
    ] },
    { id: "permission-4de164232c1f", label: "业绩报表", children: [
      { id: "permission-af58fbcdc5e7", label: "个人业绩报表", children: [
        { id: "permission-bbae2fa62b04", label: "个人业绩报表-导出" }
      ] },
      { id: "permission-3262d117145a", label: "个人业绩汇总" },
      { id: "permission-13963e5901ed", label: "业绩记录", children: [
        { id: "permission-72909ad24da8", label: "业绩记录-分单" },
        { id: "permission-89059da63c0a", label: "业绩记录-导出" }
      ] },
      { id: "permission-06ddf95356d1", label: "业绩课程汇总", children: [
        { id: "permission-3ded0c769d67", label: "业绩课程汇总-导出" }
      ] },
      { id: "permission-d2301d084f58", label: "业绩卡项汇总", children: [
        { id: "permission-6fac3f6fc03e", label: "业绩卡项汇总-导出" }
      ] },
      { id: "permission-823a257e4d9c", label: "门店业绩报表", children: [
        { id: "permission-7a7e377825d4", label: "门店业绩报表-导出" }
      ] },
      { id: "permission-1631c53492bd", label: "门店业绩趋势" },
      { id: "permission-3ef9c7586901", label: "门店数据盘点", children: [
        { id: "permission-68672780be2f", label: "门店数据盘点-导出" }
      ] }
    ] },
    { id: "permission-70b0e7cc4396", label: "异业消耗", children: [
      { id: "permission-e4bee00cd3c8", label: "异业消耗报表", children: [
        { id: "permission-489650ad72ef", label: "异业消耗报表-导入" },
        { id: "permission-bbfe11fc740e", label: "异业消耗报表-导出" }
      ] }
    ] },
    { id: "permission-fdbc6c8ebdf6", label: "客户订单报表", children: [
      { id: "permission-c30876f6a2f9", label: "客户订单报表-导出" }
    ] },
    { id: "permission-b613a7b1ee46", label: "客户报表", children: [
      { id: "permission-56bcdade9aa9", label: "客户报表-导出记录" }
    ] },
    { id: "permission-3973f812e2de", label: "门店对账", children: [
      { id: "permission-563ef4909bf5", label: "门店账单总览" },
      { id: "permission-49730a1a1dbe", label: "门店对账单" }
    ] }
  ] },
  { id: "permission-1291af84eb2b", label: "加盟", children: [
    { id: "permission-6464a39eb258", label: "加盟保证汇总" },
    { id: "permission-4887530087ae", label: "加盟商结算" },
    { id: "permission-de88033138ca", label: "加盟商对账单", children: [
      { id: "permission-3ec4f5379c27", label: "加盟商对账单-导出" }
    ] }
  ] },
  { id: "permission-402a606abc37", label: "加盟商", children: [
    { id: "permission-24efa436dd40", label: "加盟商对账单" },
    { id: "permission-a9d607bc604f", label: "用户课程消耗" },
    { id: "permission-091ce2c102e5", label: "课卡消耗明细" }
  ] },
  { id: "permission-30bfe2adc49e", label: "版本发布", children: [
    { id: "permission-8718ab3242eb", label: "奥本运动App版本" },
    { id: "permission-0850c2e2efd6", label: "奥本中台App版本" }
  ] },
  { id: "permission-7debf9cb0372", label: "设置", children: [
    { id: "permission-aafb1078c09d", label: "文件", children: [
      { id: "permission-171068a1f7d7", label: "文件列表", children: [
        { id: "permission-d6529b73e0f1", label: "文件列表-上传" },
        { id: "permission-cca842109502", label: "文件列表-删除" }
      ] },
      { id: "permission-857e1d50ea63", label: "文件夹列表", children: [
        { id: "permission-dc6a4614a72b", label: "文件夹列表-添加文件夹" },
        { id: "permission-29cebf6bb287", label: "文件夹列表-编辑" },
        { id: "permission-fa3ac6012017", label: "文件夹列表-删除" }
      ] }
    ] },
    { id: "permission-583832856442", label: "文章", children: [
      { id: "permission-c5a7f79cfe8d", label: "文章类型", children: [
        { id: "permission-102d8b88b853", label: "文章类型-新增" },
        { id: "permission-1a3b602807b2", label: "文章类型-编辑" },
        { id: "permission-30ce1af86b69", label: "文章类型-删除" }
      ] },
      { id: "permission-77369c4e9b8a", label: "文章列表", children: [
        { id: "permission-d7f1b1ee43d3", label: "文章列表-新增" },
        { id: "permission-75f49d0f28df", label: "文章列表-编辑" },
        { id: "permission-5a9cf162e65c", label: "文章列表-删除" }
      ] }
    ] },
    { id: "permission-4149c38b4da7", label: "通知人员设置", children: [
      { id: "permission-2cc13c4a5821", label: "人事通知-新增" },
      { id: "permission-f33abe5a29e0", label: "人事通知-编辑" },
      { id: "permission-20c9dc921b12", label: "人事通知-删除" }
    ] },
    { id: "permission-072ca43b38af", label: "五维问卷", children: [
      { id: "permission-668d908393ae", label: "问卷类型" },
      { id: "permission-9897c9cd0a25", label: "问题列表" },
      { id: "permission-b74d2f0ca07a", label: "得分评价" }
    ] },
    { id: "permission-a57f468b751d", label: "店铺装修", children: [
      { id: "permission-2dcb7d4c6aa3", label: "业务模块配置" },
      { id: "permission-8ed37b0c2a5c", label: "小程序弹窗" }
    ] },
    { id: "permission-8c2541310aed", label: "菜单管理", children: [
      { id: "permission-4cc342c251fb", label: "菜单管理-新增" },
      { id: "permission-c3cc3de39780", label: "菜单管理-编辑" },
      { id: "permission-4b6fc98c15e6", label: "菜单管理-删除" }
    ] },
    { id: "permission-c071d8c9e51b", label: "消息短信模板", children: [
      { id: "permission-5fda96c9540a", label: "消息短信模块-编辑" },
      { id: "permission-09a94ffd0c65", label: "消息短信模板-删除" }
    ] },
    { id: "permission-1e2788c093aa", label: "设备列表", children: [
      { id: "permission-d546df504035", label: "新增设备" },
      { id: "permission-94e9d7043ada", label: "远程开门" },
      { id: "permission-fda5bcc21258", label: "入场记录" }
    ] },
    { id: "permission-8fc2535f47e5", label: "证书类型", children: [
      { id: "permission-b2c30d835db8", label: "证书类型-新增" },
      { id: "permission-cf5a49573e8a", label: "证书类型-编辑" },
      { id: "permission-6441008e8f2b", label: "证书类型-删除" }
    ] },
    { id: "permission-ff3cb63d6c79", label: "公众号管理" },
    { id: "permission-768f2d19be18", label: "字典管理", children: [
      { id: "permission-1c8cebb956f0", label: "字典管理-新增" },
      { id: "permission-9efe7344428d", label: "字典管理-编辑" },
      { id: "permission-b6b348d71be0", label: "字典管理-删除" }
    ] },
    { id: "permission-a3514229c08b", label: "系统设置" },
    { id: "permission-dd7da233fcb5", label: "储物柜", children: [
      { id: "permission-5df5856e41f9", label: "储物柜-编辑" },
      { id: "permission-286e4dce033a", label: "储物柜-删除" },
      { id: "permission-ebed931b3645", label: "储物柜-操作日志" },
      { id: "permission-919f3dfacd7b", label: "储物柜-二维码上传" },
      { id: "permission-181dff840bf3", label: "储物柜-箱格列表" },
      { id: "permission-0186d5c1796b", label: "箱格列表-编辑" },
      { id: "permission-b66868af0201", label: "箱格列表-开柜" },
      { id: "permission-86651f993c3a", label: "箱格列表-清箱" }
    ] },
    { id: "permission-6c0a7b06e94f", label: "地区管理" },
    { id: "permission-034fc3f5b9a3", label: "日志监控", children: [
      { id: "permission-6965024cb377", label: "登录日志" },
      { id: "permission-b8fe18728b31", label: "操作日志" }
    ] }
  ] },
  { id: "permission-aa59e051af4b", label: "营销", children: [
    { id: "permission-cb1ceb66de77", label: "分享记录", children: [
      { id: "permission-ad49a0494dbb", label: "分享记录-导出" }
    ] },
    { id: "permission-fadc6f667af4", label: "核销记录", children: [
      { id: "permission-59926a090baf", label: "美团抖音核销记录-撤销" },
      { id: "permission-5cafa369830c", label: "核销记录-导出" },
      { id: "permission-616b078b512a", label: "抖音业绩绑定" },
      { id: "permission-3623958ddef4", label: "抖音对账单明细导出" }
    ] },
    { id: "permission-9546688b0dbe", label: "优惠券管理", children: [
      { id: "permission-e36f2b4e1581", label: "优惠券列表", children: [
        { id: "permission-72304b73b053", label: "优惠券-新增" },
        { id: "permission-1a266adbd1b0", label: "优惠券-编辑" },
        { id: "permission-ef0357ed98e6", label: "优惠券-删除" },
        { id: "permission-990fc8d84202", label: "优惠券-赠送" }
      ] },
      { id: "permission-1ecab513852e", label: "券包列表", children: [
        { id: "permission-66d4d8bd1eae", label: "券包管理-新增" },
        { id: "permission-ff80b350bac3", label: "券包管理-编辑" },
        { id: "permission-c1f601f0d2e7", label: "券包管理-删除" },
        { id: "permission-ec74101d66d4", label: "券包管理-赠送券包" }
      ] },
      { id: "permission-0c515fc5ee11", label: "赠送记录" }
    ] },
    { id: "permission-f4cf330e42d3", label: "活动管理", children: [
      { id: "permission-e6056f697f6a", label: "活动列表" }
    ] },
    { id: "permission-144907900f01", label: "积分管理", children: [
      { id: "permission-2d20de54a75b", label: "积分合同" },
      { id: "permission-092ac226b6dc", label: "积分记录", children: [
        { id: "permission-880ceb848b8b", label: "积分记录-导出" }
      ] },
      { id: "permission-6b3d62e7f0cf", label: "积分规则", children: [
        { id: "permission-4faaeac34af7", label: "积分规则-新增" },
        { id: "permission-3e1b58bc13c3", label: "积分规则-编辑" },
        { id: "permission-ea1fd481a61b", label: "积分规则-删除" }
      ] }
    ] },
    { id: "permission-7bc1d6f3ad2d", label: "分销报表", children: [
      { id: "permission-aebded3272d0", label: "分销绩效", children: [
        { id: "permission-d95ff9d404b1", label: "分销绩效-导出" }
      ] },
      { id: "permission-e6ddae2cfe0a", label: "分销订单", children: [
        { id: "permission-8edbb3d19e27", label: "分销订单-导出" }
      ] }
    ] }
  ] }
];

export const ROLE_PERMISSION_ROOT_COUNT = 24;
export const ROLE_PERMISSION_NODE_COUNT = 508;

export function flattenRolePermissionTree(nodes: readonly RolePermissionNode[] = ROLE_PERMISSION_TREE): RolePermissionNode[] {
  return nodes.flatMap((node) => [node, ...flattenRolePermissionTree(node.children ?? [])]);
}
