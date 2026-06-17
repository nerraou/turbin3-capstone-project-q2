import { relations } from "drizzle-orm";
import { users } from "./users";
import { merchantsProfile } from "./merchants-profiles";

export const usersProfileRelations = relations(merchantsProfile, ({ one }) => ({
  profile: one(merchantsProfile),
}));

export const profileRelations = relations(merchantsProfile, ({ one }) => ({
  user: one(users, {
    fields: [merchantsProfile.userId],
    references: [users.id],
  }),
}));
