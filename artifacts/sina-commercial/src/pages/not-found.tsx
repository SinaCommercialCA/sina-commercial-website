import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import PageMeta from "@/components/PageMeta";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <PageMeta
        title="Page Not Found — Sina Commercial"
        description="The page you requested was not found. Explore GTA commercial real estate opportunities, market intelligence, and advisory services at Sina Commercial."
        path=""
      />
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Did you forget to add the page to the router?
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
