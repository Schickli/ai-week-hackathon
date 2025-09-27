import Admin from "@/components/admin/admin";
import Process from "@/components/process/process";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex justify-center">
        <div>
          <Tabs defaultValue="cases" className="w-full">
            <div className="flex flex-row items-center justify-between px-8 mb-2 w-full">
              <TabsList>
                <TabsTrigger value="cases">Cases</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>
              <div className="text-xl font-bold tracking-tight select-none" style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '0.03em' }}>
                Next Gen Damage Estimation (VZ2)
              </div>
            </div>
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
    </div>
  );
}
