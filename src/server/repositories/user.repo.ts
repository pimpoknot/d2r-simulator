import { db } from "@/server/db/client";

export async function getDefaultUserId() {
  const GUEST_EMAIL = "guest@d2r-simulator.local";
  let user = await db.user.findUnique({
    where: { email: GUEST_EMAIL }
  });

  if (!user) {
    user = await db.user.create({
      data: {
        username: "Guest",
        email: GUEST_EMAIL,
        magicFind: 0,
        playersX: 1,
      }
    });
  }

  return user.id;
}
