import { functions } from "./functionsGenerates";

export const churchs = functions.generateChurchData();
export const offices = functions.generateOfficesData();
export const eventType = functions.generateChurchEvents();
export const profiles = functions.generateRandomUserProfiles();
export const users = Array.from({ length: 10 }, functions.generateUser);
export const permissions = functions.generateRandomPermissions();
export const profilePermissions = functions.generateRandomProfilePermissions();
export const persons = functions.generateRandomPerson();
