import Admin from "@/components/admin/admin";
import Process from "@/components/process/process";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <div className="w-full flex justify-center">
      <div>
        <div className="py-10 font-bold text-3xl">
          <h1>Next-Gen Damage Estimation</h1>
        </div>
        <Tabs defaultValue="cases" className="w-full">
          <TabsList>
            <TabsTrigger value="cases">Cases</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>
          <TabsContent value="cases" className="p-2">
            <div className="w-[90vw] mx-auto">
              <Process />
            </div>
          </TabsContent>
          <TabsContent value="admin" className="p-2 w-full">
            <div className="w-[90vw] mx-auto">
              <Admin />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
