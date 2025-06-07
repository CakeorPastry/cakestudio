local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local UIS = game:GetService("UserInputService")
local TweenService = game:GetService("TweenService")
local TweenInfoSetting = TweenInfo.new(1, Enum.EasingStyle.Linear)

local player = Players.LocalPlayer
local character = player.Character or player.CharacterAdded:Wait()
local team = player.Team

-- Auto-update team when changed
player:GetPropertyChangedSignal("Team"):Connect(function()
    team = player.Team
end)

-- Auto-update character when it respawns
player.CharacterAdded:Connect(function(char)
    character = char
end)

function randomString()
    local length = math.random(10, 20)
    local array = {}
    for i = 1, length do
        array[i] = string.char(math.random(32, 126))
    end
    return table.concat(array)
end

function releaseBall()
    local args = {
        30,
        [4] = vector.create(5, 15, 15)
    }
    game:GetService("ReplicatedStorage"):WaitForChild("Packages"):WaitForChild("Knit"):WaitForChild("Services"):WaitForChild("BallService"):WaitForChild("RE"):WaitForChild("Shoot"):FireServer(unpack(args))
end

local screenGui = Instance.new("ScreenGui", game.CoreGui)
screenGui.Name = randomString()
screenGui.ResetOnSpawn = false

local notificationFrame = Instance.new("Frame")
notificationFrame.Size = UDim2.new(0, 626, 0, 59)
notificationFrame.Position = UDim2.new(0.5, 0, 0.268415093, 0)
notificationFrame.AnchorPoint = Vector2.new(0.5, 0.5)
notificationFrame.BackgroundTransparency = 1
notificationFrame.Parent = screenGui
notificationFrame.Name = "Output"

local gridLayout = Instance.new("UIGridLayout")
gridLayout.HorizontalAlignment = Enum.HorizontalAlignment.Left
gridLayout.VerticalAlignment = Enum.VerticalAlignment.Bottom
gridLayout.SortOrder = Enum.SortOrder.LayoutOrder
gridLayout.StartCorner = Enum.StartCorner.TopLeft
gridLayout.CellPadding = UDim2.new(0, 0, 0, 0)
gridLayout.CellSize = UDim2.new(1, 0, 0.349999994, 0)
gridLayout.Parent = notificationFrame

function PlaySound(id)

    --[[
    9070284921 - Beautiful Girls (LOUD) (SHORT)
    97495881842727 - DO NOT REDEEM
    6204175492 - ara ara 2
    7784389087 - DJ Snake - YAMH
    7510781592 - slap oh
    80959855784919 - Man screaming meme sound effect
    
    ]]

    local table = {
        9070284921,
        97495881842727,
        6204175492,
        7784389087,
        7510781592,
        80959855784919
    }
    local Sound = Instance.new("Sound")
    local finalId = id or table[math.random(1, #table)]
    Sound.SoundId = "rbxassetid://" .. finalId
    Sound.Parent = workspace
    Sound:Play()
    Sound.Ended:Wait()
    Sound:Destroy()
end

function CreateNotification(text, color, duration)
    local notification = Instance.new("TextLabel")
    notification.Size = UDim2.new(1, 0, 1, 0)
    notification.AnchorPoint = Vector2.new(0.5, 0.5)
    notification.Position = UDim2.new(0, 0, 0, 0)
    notification.TextColor3 = color or Color3.new(1, 1, 1)
    notification.BackgroundTransparency = 1
    notification.TextSize = 20
    notification.Text = text
    notification.TextTransparency = 0
    notification.TextWrapped = false
    notification.TextScaled = true
    notification.Parent = notificationFrame
    task.spawn(function()
        PlaySound("9102731048")
    end)
    task.wait(duration or 5)
    local destroyTween = TweenService:Create(notification, TweenInfoSetting, { TextTransparency = 1 })
    destroyTween:Play()
    destroyTween.Completed:Wait()
    notification:Destroy()
end

if game.GameId ~= 6325068386 then
    task.spawn(function()
        CreateNotification("This script is only for the game \"Blue Lock: Rivals\".", Color3.new(255, 0, 0), 5)
        screenGui:Destroy()
    end)
    PlaySound()
    return
end

if imsorry_pleaseforgiveme_BlueLockRivals_Pasw_lua_LOADED then
    task.spawn(function()
        CreateNotification("This script is already running!", Color3.new(255, 0, 0), 5)
        screenGui:Destroy()
    end)
    pcall(function() imsorry_pleaseforgiveme_BlueLockRivals_Pasw_lua_frame.Position = UDim2.new(0, 10, 0.5, -40) end)
    error("/imsorry/pleaseforgiveme/BlueLockRivals/Pasw.lua is already running!", 0)
    return
end

pcall(function() getgenv().imsorry_pleaseforgiveme_BlueLockRivals_Pasw_lua_LOADED = true end)




local frameHeight = 220
local headerHeight = 36
local isMinimized = false

local frame = Instance.new("Frame", screenGui)
frame.Size = UDim2.new(0, 240, 0, frameHeight)
frame.Position = UDim2.new(0, 10, 0.5, -frameHeight / 2)
frame.BackgroundColor3 = Color3.new(0.1, 0.1, 0.1)
frame.Active = true
frame.Draggable = true
frame.Name = randomString()
frame.BorderSizePixel = 0

-- Title Bar
local header = Instance.new("Frame", frame)
header.Size = UDim2.new(1, 0, 0, headerHeight)
header.BackgroundColor3 = Color3.new(0.15, 0.15, 0.15)
header.BorderSizePixel = 0
header.Name = "Header"

local title = Instance.new("TextLabel", header)
title.Size = UDim2.new(1, -36, 1, 0)
title.Position = UDim2.new(0, 6, 0, 0)
title.BackgroundTransparency = 1
title.Text = "Pasw Menu"
title.TextColor3 = Color3.new(1, 1, 1)
title.Font = Enum.Font.SourceSansBold
title.TextSize = 18
title.TextXAlignment = Enum.TextXAlignment.Left

local minimizeBtn = Instance.new("TextButton", header)
minimizeBtn.Size = UDim2.new(0, 30, 0, 30)
minimizeBtn.Position = UDim2.new(1, -32, 0, 3)
minimizeBtn.Text = "-"
minimizeBtn.BackgroundColor3 = Color3.new(0.2, 0.2, 0.2)
minimizeBtn.TextColor3 = Color3.new(1, 1, 1)
minimizeBtn.Font = Enum.Font.SourceSansBold
minimizeBtn.TextSize = 20
minimizeBtn.BorderSizePixel = 0

-- Content Section
local content = Instance.new("Frame", frame)
content.Position = UDim2.new(0, 0, 0, headerHeight)
content.Size = UDim2.new(1, 0, 1, -headerHeight)
content.BackgroundTransparency = 1
content.Name = "Content"

local scrollingFrame = Instance.new("ScrollingFrame", content)
scrollingFrame.Size = UDim2.new(1, -20, 1, -20)
scrollingFrame.Position = UDim2.new(0, 10, 0, 10)
scrollingFrame.CanvasSize = UDim2.new(0, 0, 1, 0)
scrollingFrame.ScrollBarThickness = 6
scrollingFrame.BackgroundTransparency = 1
scrollingFrame.AutomaticCanvasSize = Enum.AutomaticSize.Y
scrollingFrame.ScrollingDirection = Enum.ScrollingDirection.Y
scrollingFrame.Name = randomString()

local gridLayout = Instance.new("UIGridLayout", scrollingFrame)
gridLayout.HorizontalAlignment = Enum.HorizontalAlignment.Left
gridLayout.VerticalAlignment = Enum.VerticalAlignment.Top
gridLayout.SortOrder = Enum.SortOrder.LayoutOrder
gridLayout.StartCorner = Enum.StartCorner.TopLeft
gridLayout.CellPadding = UDim2.new(0, 6, 0, 6)
gridLayout.CellSize = UDim2.new(1, -12, 0, 40)
gridLayout.Name = randomString()

local PaswButton = Instance.new("TextButton", scrollingFrame)
PaswButton.Size = UDim2.new(1, -12, 0, 30)
PaswButton.Text = "Pasw"
PaswButton.BackgroundColor3 = Color3.new(0.2, 0.2, 0.2)
PaswButton.TextColor3 = Color3.new(1, 1, 1)
PaswButton.Name = randomString()

-- Minimize Toggle
minimizeBtn.MouseButton1Click:Connect(function()
	isMinimized = not isMinimized
	if isMinimized then
		content.Visible = false
		frame.Size = UDim2.new(0, 240, 0, headerHeight)
	else
		content.Visible = true
		frame.Size = UDim2.new(0, 240, 0, frameHeight)
	end
end)

pcall(function() getgenv().imsorry_pleaseforgiveme_BlueLockRivals_Pasw_lua_frame = frame end)

local canUse = true

local function getBestTarget()
    local camera = workspace.CurrentCamera
    local hrp = character and character:FindFirstChild("HumanoidRootPart")
    if not hrp then return end

    local furthest, furthestDist = nil, -1
    local bestInView, viewAngle = nil, math.huge

    for _, p in ipairs(Players:GetPlayers()) do
        if p ~= player and p.Team == team and p.Character and p.Character:FindFirstChild("HumanoidRootPart") then
            local targetHRP = p.Character.HumanoidRootPart
            local dirToTarget = (targetHRP.Position - hrp.Position).Unit
            local cameraDir = camera.CFrame.LookVector
            local angle = math.deg(math.acos(dirToTarget:Dot(cameraDir)))
            local dist = (hrp.Position - targetHRP.Position).Magnitude

            if dist > furthestDist then
                furthest = p
                furthestDist = dist
            end

            if angle <= 25 and angle < viewAngle then
                viewAngle = angle
                bestInView = p
            end
        end
    end

    return bestInView or furthest
end

local ABC = {}
ABC.Connections = {}

function ABC:Connect(signal, func)
    local conn = signal:Connect(func)
    table.insert(self.Connections, conn)
end

function ABC:Clean()
    for _, conn in ipairs(self.Connections) do
        if conn.Disconnect then conn:Disconnect() end
    end
    self.Connections = {}
end

local function Pasw()
    if not canUse then
        CreateNotification("Ability is on cooldown.", Color3.new(255, 255, 0), 5)
        return
    end

    local hrp = character and character:FindFirstChild("HumanoidRootPart")
    local football = character and character:FindFirstChild("Football")
    local hasBall = character and character:FindFirstChild("Values") and character.Values:FindFirstChild("HasBall")

    if not (hasBall and hasBall.Value) or not football or not hrp then
        CreateNotification("Missing ball, HumanoidRootPart or you don't have the ball.", Color3.new(255, 0, 0), 5)
        return
    end

    local target = getBestTarget()
    if not target or not target.Character or not target.Character:FindFirstChild("HumanoidRootPart") then
        CreateNotification("No valid teammate to pass to.", Color3.new(255, 255, 0), 5)
        return
    end

    local targetHRP = target.Character.HumanoidRootPart

    local anim = Instance.new("Animation")
    anim.AnimationId = "rbxassetid://83376040878208"
    local track = character:FindFirstChildOfClass("Humanoid"):LoadAnimation(anim)
    track.Priority = Enum.AnimationPriority.Action4
    track:Play()
    task.spawn(function()
        PlaySound("87838758006658")
    end)

    canUse = false
    task.delay(1, function()
        canUse = true
    end)

    releaseBall()
    task.wait(0.5)

    local dir = (targetHRP.Position + targetHRP.AssemblyLinearVelocity * Vector3.new(1, 0, 1) - hrp.Position).Unit + Vector3.new(0, 0.5, 0)
    local speed = math.clamp((targetHRP.Position - hrp.Position).Magnitude * 1.5, 0, 150)
    football.AssemblyLinearVelocity = dir * speed

    local t0 = tick()
    ABC:Clean()
    ABC:Connect(RunService.Heartbeat, function(dt)
        if tick() - t0 > 10 or not football or not football.Parent then
            ABC:Clean()
            return
        end
        dir = dir:Lerp((targetHRP.Position - football.Position).Unit + Vector3.new(0, 0.35, 0), 6.5 * dt)
        speed = math.clamp((targetHRP.Position - hrp.Position).Magnitude * 2.75, 0, 150)
        football.AssemblyLinearVelocity = dir * speed
    end)
end

PaswButton.Activated:Connect(Pasw)

task.spawn(function()
    CreateNotification("Cf pasw", Color3.new(0, 255, 0), 5)
end)
PlaySound()
