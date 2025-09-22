import { relations } from 'drizzle-orm';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import type { KyselifyBetter } from './KyselifyBetter.ts';
import { LocalMediaSourcePath } from './LocalMediaSourcePath.ts';

export const LocalMediaFolder = sqliteTable('local_media_folder', {
  uuid: text().primaryKey(),
  path: text().notNull(),
  localMediaSourcePathId: text()
    .notNull()
    .references(() => LocalMediaSourcePath.uuid, { onDelete: 'cascade' }),
});

export const LocalMediaFolderRelations = relations(
  LocalMediaFolder,
  ({ one, many }) => ({
    parent: one(LocalMediaFolder, {
      fields: [LocalMediaFolder.uuid],
      references: [LocalMediaFolder.uuid],
    }),
    children: many(LocalMediaFolder),
    localMediaSourcePath: one(LocalMediaSourcePath, {
      fields: [LocalMediaFolder.localMediaSourcePathId],
      references: [LocalMediaSourcePath.uuid],
    }),
  }),
);

export type LocalMediaFolderTable = KyselifyBetter<typeof LocalMediaFolder>;
