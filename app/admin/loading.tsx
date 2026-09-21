import { AsyncMainContainer } from "@/components/containers/MainContainer";

// Suspense-fallback for alle sider under /admin. Next pakker automatisk siden i en <Suspense> med denne som fallback,
// så ingen admin-side trenger sin egen <Suspense>. Vises kun mens en side streames inn — data som lastes i selve
// komponentene (f.eks. katalogene) har egne laste-tilstander.
export default function AdminLoading() {
  return <AsyncMainContainer size="lg" py={30} loading />;
}
