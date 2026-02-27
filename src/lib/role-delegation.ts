import SystemSettings from '@/models/SystemSettings';

export type Role = "admin" | "author" | "editor" | "user";
export type Mode = "MODE_1" | "MODE_2" | "MODE_3";

export async function canManageRole(
  currentRole: Role,
  targetRole: Role
): Promise<boolean> {
  let settings = await SystemSettings.findOne();
  
  if (!settings) {
    settings = await SystemSettings.create({
      roleSystemEnabled: true,
      governanceMode: "MODE_1"
    });
  }

  if (!settings.roleSystemEnabled) {
    return false; 
  }

  const mode = settings.governanceMode as Mode;

  const matrix: Record<string, Record<string, string[]>> = {
    MODE_1: {
      admin: ["author", "editor", "user"],
      author: [],
      editor: [],
      user: []
    },
    MODE_2: {
      admin: ["admin", "author"],
      author: ["author", "editor"],
      editor: ["editor", "user"],
      user: []
    },
    MODE_3: {
      admin: ["author", "editor", "user"],
      author: ["editor", "user"],
      editor: ["user"],
      user: []
    }
  };

  const allowedRoles = matrix[mode]?.[currentRole] || [];
  return allowedRoles.includes(targetRole);
}

export async function isRoleSystemEnabled(): Promise<boolean> {
  const settings = await SystemSettings.findOne();
  return settings ? settings.roleSystemEnabled : true;
}

export async function getGovernanceMode(): Promise<Mode> {
  const settings = await SystemSettings.findOne();
  return (settings?.governanceMode as Mode) || "MODE_1";
}
