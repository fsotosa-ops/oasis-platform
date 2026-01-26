import { CommunityFeed } from "@/frontend/components/participant/CommunityFeed";

export default function CommunityPage() {
    return (
        <div className="space-y-8">
             <div className="text-center md:text-left">
                <h1 className="font-heading text-3xl font-bold text-gray-800">Comunidad OASIS</h1>
                <p className="text-gray-600">Un espacio seguro para compartir y crecer juntos.</p>
            </div>
            
            <CommunityFeed />
        </div>
    )
}
