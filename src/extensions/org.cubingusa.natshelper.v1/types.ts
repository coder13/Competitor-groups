export interface Stage {
  id: number;
  name: string;
  color: string;
}

export interface NatsHelperStageExtensionData {
  stages: Stage[];
}

export interface NatsHelperGroupExtensionData {
  stageId: number;
}
