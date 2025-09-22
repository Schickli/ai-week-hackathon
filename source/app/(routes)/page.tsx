import Admin from "@/components/admin/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <div className="w-full flex justify-center">
      <div>
        <div className="py-10 font-bold text-3xl">
          <h1>Next-Gen Damage Estimation</h1>
        </div>
        <Tabs defaultValue="cases" className="w-[1000px]">
          <TabsList>
            <TabsTrigger value="cases">Cases</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>
          <TabsContent value="cases" className="p-2">
            Decide on cases
          </TabsContent>
          <TabsContent value="admin" className="p-2">
            <Admin />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
