declare module 'lucide-react' {
  import { ComponentType, SVGProps } from 'react';
  
  type IconProps = SVGProps<SVGSVGElement> & {
    size?: string | number;
  };
  
  // Icons from attachments.tsx
  export const XIcon: ComponentType<IconProps>;
  export const PlusIcon: ComponentType<IconProps>;
  export const FileText: ComponentType<IconProps>;
  
  // Icons from markdown-text.tsx
  export const CheckIcon: ComponentType<IconProps>;
  export const CopyIcon: ComponentType<IconProps>;
  
  // Icons from thread.tsx
  export const ArrowDownIcon: ComponentType<IconProps>;
  export const ArrowUpIcon: ComponentType<IconProps>;
  export const ChevronLeftIcon: ComponentType<IconProps>;
  export const ChevronRightIcon: ComponentType<IconProps>;
  export const PencilIcon: ComponentType<IconProps>;
  export const RefreshCwIcon: ComponentType<IconProps>;
  export const Square: ComponentType<IconProps>;
  
  // Icons from thread-list.tsx
  export const ArchiveIcon: ComponentType<IconProps>;
  
  // Icons from threadlist-sidebar.tsx and emails
  export const Github: ComponentType<IconProps>;
  export const MessagesSquare: ComponentType<IconProps>;
  export const MessageCircleIcon: ComponentType<IconProps>;
  
  // Icons from tool-fallback.tsx
  export const ChevronDownIcon: ComponentType<IconProps>;
  export const ChevronUpIcon: ComponentType<IconProps>;
  
  // Icons from automation.tsx
  export const ChevronDown: ComponentType<IconProps>;
  export const SendIcon: ComponentType<IconProps>;
  
  // Icons from human-in-the-loop.tsx
  export const CheckCircle2: ComponentType<IconProps>;
  export const AlertCircle: ComponentType<IconProps>;
  
  // Icons from plan-approval.tsx
  export const Circle: ComponentType<IconProps>;
  export const Clock: ComponentType<IconProps>;
  export const Trash2: ComponentType<IconProps>;
  
  // Icons from todo.tsx
  export const Sparkles: ComponentType<IconProps>;
  
  // Icons from breadcrumb.tsx
  export const ChevronRight: ComponentType<IconProps>;
  export const MoreHorizontal: ComponentType<IconProps>;
  
  // Icons from sidebar.tsx
  export const PanelLeftIcon: ComponentType<IconProps>;
  
  // Common icons
  export const Send: ComponentType<IconProps>;
  export const Download: ComponentType<IconProps>;
  export const Upload: ComponentType<IconProps>;
  export const Loader2: ComponentType<IconProps>;
  export const Check: ComponentType<IconProps>;
  export const X: ComponentType<IconProps>;
  export const Plus: ComponentType<IconProps>;
  export const Trash: ComponentType<IconProps>;
  export const Edit: ComponentType<IconProps>;
  export const Save: ComponentType<IconProps>;
  export const Cancel: ComponentType<IconProps>;
  export const Menu: ComponentType<IconProps>;
  export const Close: ComponentType<IconProps>;
  export const ChevronLeft: ComponentType<IconProps>;
  export const ChevronUp: ComponentType<IconProps>;
  
  // Add any other icons used in the project as needed
  const lucideReact: {
    [key: string]: ComponentType<IconProps>;
  };
  
  export default lucideReact;
}