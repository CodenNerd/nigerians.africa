import { store } from "@nigeria-for-nigerians/domain";
import {
  isFollowableEntityType,
  type FollowableEntityType,
  type ResolvedFollowable,
} from "./types";

export function resolveFollowable(
  entityType: string,
  entityId: string,
): ResolvedFollowable | null {
  if (!isFollowableEntityType(entityType) || !entityId) return null;

  switch (entityType as FollowableEntityType) {
    case "organization": {
      const o = store.allOrganizations().find((x) => x.id === entityId);
      if (!o) return null;
      return {
        entityType,
        entityId: o.id,
        entitySlug: o.slug,
        entityTitle: o.name,
        href: `/organizations/${o.slug}`,
      };
    }
    case "person": {
      const p = store.allPeople().find((x) => x.id === entityId);
      if (!p) return null;
      return {
        entityType,
        entityId: p.id,
        entitySlug: p.slug,
        entityTitle: p.fullName,
        href: `/people/${p.slug}`,
      };
    }
    case "problem": {
      const p = store.allProblems().find((x) => x.id === entityId);
      if (!p) return null;
      return {
        entityType,
        entityId: p.id,
        entitySlug: p.slug,
        entityTitle: p.title,
        href: `/problems/${p.slug}`,
      };
    }
    case "project": {
      const p = store.allProjects().find((x) => x.id === entityId);
      if (!p) return null;
      return {
        entityType,
        entityId: p.id,
        entitySlug: p.slug,
        entityTitle: p.name,
        href: `/projects/${p.slug}`,
      };
    }
    case "matter": {
      const m = store.allProsecutionMatters().find((x) => x.id === entityId);
      if (!m) return null;
      const scheme = store.allCivicSchemes().find((s) => s.id === m.schemeId);
      const schemeSlug = scheme?.slug ?? "make-nigeria-better";
      return {
        entityType,
        entityId: m.id,
        entitySlug: m.slug,
        entityTitle: m.title,
        href: `/schemes/${schemeSlug}/${m.slug}`,
      };
    }
    default:
      return null;
  }
}
