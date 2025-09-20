
import { AdminActions } from '~/components/client/admin-actions'
import Header from '~/components/reusables/header'
import HeroSection from '~/components/reusables/hero'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

export default function AdminPage() {
    return (
        <div className='min-h-screen bg-background'>
            <Header title='Admin Panel' />
            {/* // quick actions like addBooks, addEssay, addQuotes, view stats, etc. */}
            <HeroSection
                title="Admin Panel"
                description="Manage the content and settings of Udit's Attic from this centralized dashboard."
                subtitle="Where I manage my digital attic"
            />
            {/* // some admin buttons for quick actions */}
            <div className="mt-8 px-8">
                <Card className="paper-card">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Jump to content creation</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <AdminActions />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
