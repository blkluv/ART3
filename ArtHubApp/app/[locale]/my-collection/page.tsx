"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { Grid, List, ChevronDown, Filter, ExternalLink, Share2 } from "lucide-react"
import { useSearchParams, useParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { defaultLocale } from "@/config/i18n"
import { useAccount } from 'wagmi'
import { SubscriptionStatusV4 } from "@/components/subscription-status-v4"

// NFT data structure
interface NFT {
  id: string
  name: string
  description: string
  image_ipfs_hash: string
  metadata_ipfs_hash: string
  transaction_hash: string
  network: string
  royalty_percentage: number
  created_at: string
  contract_address?: string
  token_id?: number
}

// Translation content
const translations = {
  en: {
    title: "My Collection",
    filterOptions: [
      { value: "all", label: "All NFTs" },
      { value: "created", label: "Created by me" },
      { value: "collected", label: "Collected" },
      { value: "recent", label: "Recently minted" }
    ],
    sortOptions: [
      { value: "newest", label: "Newest first" },
      { value: "oldest", label: "Oldest first" },
      { value: "price-high", label: "Price: High to Low" },
      { value: "price-low", label: "Price: Low to High" }
    ],
    minted: "Minted",
    details: "Details",
    new: "New",
    noNftsTitle: "No NFTs Yet",
    noNftsDescription: "You haven't minted or collected any NFTs yet.",
    createFirstNft: "Create Your First NFT",
    loading: "Loading your collection...",
    error: "Failed to load collection",
    connectWallet: "Connect your wallet to view your collection",
    subscription: "Subscription",
    currentPlan: "Current Plan",
    freePlan: "Free",
    masterPlan: "Master",
    elitePlan: "Elite Creator",
    inactive: "Inactive",
    expires: "Expires",
    nftsUsed: "NFTs Used",
    unlimited: "Unlimited",
    gaslessMinting: "Gasless Minting",
    enabled: "Enabled",
    disabled: "Disabled",
    upgrade: "Upgrade to Master",
    subscribeMaster: "Subscribe to Master",
    subscribeElite: "Subscribe to Elite Creator",
    month: "month"
  },
  es: {
    title: "Mi Colección",
    filterOptions: [
      { value: "all", label: "Todos los NFTs" },
      { value: "created", label: "Creados por mí" },
      { value: "collected", label: "Coleccionados" },
      { value: "recent", label: "Acuñados recientemente" }
    ],
    sortOptions: [
      { value: "newest", label: "Más recientes primero" },
      { value: "oldest", label: "Más antiguos primero" },
      { value: "price-high", label: "Precio: Mayor a Menor" },
      { value: "price-low", label: "Precio: Menor a Mayor" }
    ],
    minted: "Acuñado",
    details: "Detalles",
    new: "Nuevo",
    noNftsTitle: "Aún no hay NFTs",
    noNftsDescription: "Todavía no has acuñado ni coleccionado ningún NFT.",
    createFirstNft: "Crea Tu Primer NFT",
    loading: "Cargando tu colección...",
    error: "Error al cargar la colección",
    connectWallet: "Conecta tu billetera para ver tu colección",
    subscription: "Suscripción",
    currentPlan: "Plan Actual",
    freePlan: "Gratis",
    masterPlan: "Master",
    elitePlan: "Creador Elite",
    inactive: "Inactivo",
    expires: "Expira",
    nftsUsed: "NFTs Usados",
    unlimited: "Ilimitado",
    gaslessMinting: "Minteo Sin Gas",
    enabled: "Activado",
    disabled: "Desactivado",
    upgrade: "Actualizar a Master",
    subscribeMaster: "Suscribirse a Master",
    subscribeElite: "Suscribirse a Creador Elite",
    month: "mes"
  },
  fr: {
    title: "Ma Collection",
    filterOptions: [
      { value: "all", label: "Tous les NFTs" },
      { value: "created", label: "Créés par moi" },
      { value: "collected", label: "Collectionnés" },
      { value: "recent", label: "Récemment frappés" }
    ],
    sortOptions: [
      { value: "newest", label: "Plus récents d'abord" },
      { value: "oldest", label: "Plus anciens d'abord" },
      { value: "price-high", label: "Prix: Élevé à Bas" },
      { value: "price-low", label: "Prix: Bas à Élevé" }
    ],
    minted: "Frappé",
    details: "Détails",
    new: "Nouveau",
    noNftsTitle: "Pas encore de NFTs",
    noNftsDescription: "Vous n'avez pas encore frappé ou collectionné de NFTs.",
    createFirstNft: "Créez Votre Premier NFT",
    loading: "Chargement de votre collection...",
    error: "Échec du chargement de la collection",
    connectWallet: "Connectez votre portefeuille pour voir votre collection",
    subscription: "Abonnement",
    currentPlan: "Plan Actuel",
    freePlan: "Gratuit",
    masterPlan: "Master",
    elitePlan: "Créateur Elite",
    inactive: "Inactif",
    expires: "Expire",
    nftsUsed: "NFTs Utilisés",
    unlimited: "Illimité",
    gaslessMinting: "Minage Sans Gaz",
    enabled: "Activé",
    disabled: "Désactivé",
    upgrade: "Passer à Master",
    subscribeMaster: "S'abonner à Master",
    subscribeElite: "S'abonner à Créateur Elite",
    month: "mois"
  },
  pt: {
    title: "Minha Coleção",
    filterOptions: [
      { value: "all", label: "Todos os NFTs" },
      { value: "created", label: "Criados por mim" },
      { value: "collected", label: "Colecionados" },
      { value: "recent", label: "Recentemente cunhados" }
    ],
    sortOptions: [
      { value: "newest", label: "Mais recentes primeiro" },
      { value: "oldest", label: "Mais antigos primeiro" },
      { value: "price-high", label: "Preço: Alto para Baixo" },
      { value: "price-low", label: "Preço: Baixo para Alto" }
    ],
    minted: "Cunhado",
    details: "Detalhes",
    new: "Novo",
    noNftsTitle: "Ainda Sem NFTs",
    noNftsDescription: "Você ainda não cunhou ou colecionou nenhum NFT.",
    createFirstNft: "Crie Seu Primeiro NFT",
    loading: "Carregando sua coleção...",
    error: "Falha ao carregar a coleção",
    connectWallet: "Conecte sua carteira para ver sua coleção",
    subscription: "Assinatura",
    currentPlan: "Plano Atual",
    freePlan: "Grátis",
    masterPlan: "Master",
    elitePlan: "Criador Elite",
    inactive: "Inativo",
    expires: "Expira",
    nftsUsed: "NFTs Usados",
    unlimited: "Ilimitado",
    gaslessMinting: "Mintagem Sem Gás",
    enabled: "Ativado",
    disabled: "Desativado",
    upgrade: "Atualizar para Master",
    subscribeMaster: "Assinar Master",
    subscribeElite: "Assinar Criador Elite",
    month: "mês"
  }
}

export default function MyCollectionPage() {
  const params = useParams()
  const [locale, setLocale] = useState<string>(defaultLocale)
  const [t, setT] = useState(translations.en)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const highlightedNftId = searchParams.get("highlight")
  
  const { address, isConnected } = useAccount()

  // Update locale when params change
  useEffect(() => {
    const currentLocale = (params?.locale as string) || defaultLocale
    setLocale(currentLocale)
    setT(translations[currentLocale as keyof typeof translations] || translations.en)
  }, [params])

  // Fetch NFTs when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      fetchNFTs()
    } else {
      setLoading(false)
      setNfts([])
    }
  }, [isConnected, address])

  const fetchNFTs = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/nfts?wallet_address=${address}`)
      const data = await response.json()
      
      if (response.ok) {
        setNfts(data.nfts || [])
        setError('')
      } else {
        setError(data.error || t.error)
      }
    } catch (err) {
      console.error('Error fetching NFTs:', err)
      setError(t.error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    })
  }

  // Filter options
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  
  // Filter and sort NFTs based on current selections
  const filteredAndSortedNfts = nfts
    .filter((nft) => {
      switch (selectedFilter) {
        case "all":
          return true
        case "created":
          return true // All NFTs in our database are created by the user
        case "collected":
          return false // Future enhancement for collected NFTs
        case "recent":
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return new Date(nft.created_at) > weekAgo
        default:
          return true
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })
  
  // Get current sort option
  const currentSortOption = t.sortOptions.find((option) => option.value === sortBy)

  if (!isConnected) {
    return (
      <div className="pb-16">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-center mt-10">{t.title}</h1>
        </div>
        <div className="container mx-auto px-4 py-4">
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold mb-2">{t.connectWallet}</h2>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-16">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-center mt-10">{t.title}</h1>
      </div>

      {/* V4 Subscription Status Section */}
      <div className="container mx-auto px-4 pt-4">
        <SubscriptionStatusV4 
          translations={t} 
          onRefresh={() => {
            fetchNFTs()
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-6">
          <Tabs value={selectedFilter} onValueChange={setSelectedFilter} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              {t.filterOptions.map((option) => (
                <TabsTrigger key={option.value} value={option.value} className="text-xs">
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {filteredAndSortedNfts.length} of {nfts.length} NFTs
            </span>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              className={viewMode === "grid" ? "bg-[#FF69B4] hover:bg-[#FF1493]" : ""}
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              className={viewMode === "list" ? "bg-[#FF69B4] hover:bg-[#FF1493]" : ""}
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                <Filter className="h-4 w-4 mr-1" />
                {currentSortOption?.label}
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {t.sortOptions.map((option) => (
                <DropdownMenuItem key={option.value} onClick={() => setSortBy(option.value)}>
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">{t.loading}</p>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchNFTs} variant="outline">
              Retry
            </Button>
          </div>
        ) : nfts.length > 0 ? (
          <>
            {filteredAndSortedNfts.length > 0 ? (
              <div className={viewMode === "grid" ? "grid grid-cols-2 gap-4" : "space-y-4"}>
                {filteredAndSortedNfts.map((nft) => (
                  <Card
                    key={nft.id}
                    className={`overflow-hidden ${
                      highlightedNftId === nft.id ? "border-[#9ACD32] border-2 shadow-lg" : ""
                    }`}
                  >
                    {viewMode === "grid" ? (
                      <>
                        <div className="aspect-square relative">
                          <Image 
                            src={`https://gateway.pinata.cloud/ipfs/${nft.image_ipfs_hash}`} 
                            alt={nft.name} 
                            fill 
                            className="object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg'
                            }}
                          />
                          {highlightedNftId === nft.id && (
                            <Badge className="absolute top-2 right-2 bg-[#9ACD32]">{t.new}</Badge>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-semibold text-sm truncate">{nft.name}</h3>
                            <Badge variant="secondary" className="text-xs">{nft.network}</Badge>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{t.minted} {formatDate(nft.created_at)}</p>
                          <p className="text-xs text-gray-600 mb-3 line-clamp-2">{nft.description}</p>
                          <div className="flex justify-between items-center">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs px-2 py-0 h-7"
                              onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${nft.image_ipfs_hash}`, '_blank')}
                            >
                              View Image
                            </Button>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${nft.metadata_ipfs_hash}`, '_blank')}
                              >
                                <Share2 className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => window.open(`https://basescan.org/tx/${nft.transaction_hash}`, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </>
                    ) : (
                      <div className="flex p-3">
                        <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                          <Image 
                            src={`https://gateway.pinata.cloud/ipfs/${nft.image_ipfs_hash}`} 
                            alt={nft.name} 
                            fill 
                            className="object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg'
                            }}
                          />
                          {highlightedNftId === nft.id && (
                            <Badge className="absolute top-1 right-1 bg-[#9ACD32] text-xs">{t.new}</Badge>
                          )}
                        </div>
                        <div className="ml-3 flex-grow">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold">{nft.name}</h3>
                            <Badge variant="secondary" className="text-xs">{nft.network}</Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">{nft.description}</p>
                          <p className="text-xs text-gray-500 mb-2">{t.minted} {formatDate(nft.created_at)}</p>
                          <div className="flex justify-between items-center">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs px-2 py-0 h-7"
                              onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${nft.image_ipfs_hash}`, '_blank')}
                            >
                              View Image
                            </Button>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${nft.metadata_ipfs_hash}`, '_blank')}
                              >
                                <Share2 className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => window.open(`https://basescan.org/tx/${nft.transaction_hash}`, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <h2 className="text-xl font-semibold mb-2">No NFTs found</h2>
                <p className="text-gray-600 mb-4">No NFTs match the current filter selection.</p>
                <Button onClick={() => setSelectedFilter("all")} variant="outline">
                  Show All NFTs
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold mb-2">{t.noNftsTitle}</h2>
            <p className="text-gray-600 mb-6">{t.noNftsDescription}</p>
            <Button className="bg-[#9ACD32] hover:bg-[#7CFC00]">{t.createFirstNft}</Button>
          </div>
        )}
      </div>
    </div>
  )
} 