/**
 * 0014 Cycle A/B - 组织架构页专用小图标（本地内联 SVG，不新增依赖）。
 *
 * 纯视觉 Mock 展示：公司/组织展示框图标、组织树文件夹图标（Cycle A），
 * 人脸照片相机图标、可登录门店 Transfer 左右移动箭头（Cycle B 纯视觉轮）。
 * 不参与任何业务逻辑；不引入 @ant-design/icons（非直接依赖，不新增依赖）。
 */

interface OrganizationIconProps {
  size?: number;
}

/** 公司/组织展示框图标（小型建筑）。 */
export function CompanyIcon({ size = 14 }: OrganizationIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 14V5.2c0-.66.54-1.2 1.2-1.2h.5V2.9c0-.5.4-.9.9-.9h4.8c.5 0 .9.4.9.9v3.1h.5c.66 0 1.2.54 1.2 1.2V14H3Z"
        stroke="#7D8CA3"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path
        d="M6.4 5.4h3.2M6.4 8h3.2M6.4 10.6h3.2M3 14h10"
        stroke="#7D8CA3"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 组织树部门文件夹图标（有子节点的组织单元）。 */
export function FolderIcon({ size = 14 }: OrganizationIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2 4.2c0-.94.76-1.7 1.7-1.7h2.86c.45 0 .88.18 1.2.5l.7.7h4.84c.94 0 1.7.76 1.7 1.7v6.4c0 .94-.76 1.7-1.7 1.7H3.7c-.94 0-1.7-.76-1.7-1.7V4.2Z"
        fill="#EFF3F8"
        stroke="#9AAFC6"
        strokeWidth="1"
      />
    </svg>
  );
}

/** 相机/图片图标（人脸照片上传占位，浅灰，Cycle B 纯视觉）。 */
export function CameraIcon({ size = 40 }: OrganizationIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="5" y="13" width="38" height="27" rx="4" stroke="#B7BDC6" strokeWidth="2" />
      <path
        d="M16 13l2.6-4.2a2 2 0 0 1 1.7-.9h7.4a2 2 0 0 1 1.7.9L32 13"
        stroke="#B7BDC6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="27" r="8" stroke="#B7BDC6" strokeWidth="2" />
      <path d="M36 20.5h.01" stroke="#B7BDC6" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** 右向箭头（可登录门店 Transfer 右移按钮，currentColor 继承按钮文字色）。 */
export function RightArrowIcon({ size = 18 }: OrganizationIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M6.2 4.3 9.9 8l-3.7 3.7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 左向箭头（可登录门店 Transfer 左移按钮，currentColor 继承按钮文字色）。 */
export function LeftArrowIcon({ size = 18 }: OrganizationIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M9.8 4.3 6.1 8l3.7 3.7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
