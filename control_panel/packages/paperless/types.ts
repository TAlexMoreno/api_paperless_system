export interface plessLoginResponse {
    token: string;
}

export interface plessSocialAccount {
    id: number;
    provider: string;
    name: string;
}

export interface plessProfile {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  auth_token: string;
  social_accounts: plessSocialAccount[];
  has_usable_password: boolean;
  is_mfa_enabled: boolean;
  username?: string;
}

export interface plessGroup {
    id: number;
    name: string;
    permissions: string[];
}

export interface plessUser {
    id: number;
    username: string;
    is_staff: boolean;
    is_superuser: boolean;
    groups: plessGroup[];
}

export interface plessSettings {
    theme: {
      color: string,
    },
    search: {
      db_only: boolean,
      more_link: string,
    },
    version: string,
    app_logo: string | null,
    language: string,
    app_title: string,
    bulk_edit: {
      apply_on_close: boolean,
      confirmation_dialogs: boolean
    },
    dark_mode: {
      enabled: boolean,
      use_system: boolean,
      thumb_inverted: boolean
    },
    ai_enabled: boolean,
    permissions: {
      default_owner: number,
      default_edit_users: number[],
      default_view_users: number[],
      default_edit_groups: number[],
      default_view_groups: number[]
    },
    saved_views: {
      warn_on_unsaved_change: boolean,
      sidebar_views_show_count: boolean,
      sidebar_views_visible_ids: number[],
      dashboard_views_sort_order: number[],
      dashboard_views_visible_ids: number[]
    },
    trash_delay: number,
    date_display: {
      date_format: string,
      date_locale: string
    },
    slim_sidebar: boolean,
    email_enabled: boolean,
    notes_enabled: boolean,
    notifications: {
      consumer_failed: boolean,
      consumer_success: boolean,
      consumer_new_documents: boolean,
      consumer_suppress_on_dashboard: boolean
    },
    tour_complete: boolean,
    update_checking: {
      enabled: boolean,
      backend_setting: string
    },
    auditlog_enabled: boolean,
    documentListSize: number,
    document_details: {
      hidden_fields: string[],
      native_pdf_viewer: boolean,
      pdf_viewer_zoom_setting: string
    },
    document_editing: {
      default_edit_mode: string,
      overlay_thumbnail: boolean,
      remove_inbox_tags: boolean
    },
    attributes_sections_collapsed: string[],
}

export interface plessUISettings {
    user: plessUser;
    settings: plessSettings;
    permissions: string[];
}

export interface ApiPaperlessCollection<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface DocumentType {
  id?: number;
  slug?: string;
  name: string;
  match?: string;
  matching_algorithm?: number;
  is_insensitive?: boolean;
  document_count?: number;
  owner?: number;
  permissions?: {
    view: {
      users: number[],
      groups: number[]
    },
    change: {
      users: number[],
      groups: number[]
    }
  },
  user_can_change?: boolean
}